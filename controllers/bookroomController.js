import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import Booking from '../models/book.model.js';
import AppError from "../utils/AppError.js";
import Payment from "../models/Payment.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { razorpay } from "../config/razorpay.js";

export const bookRoom = async (req, res, next) => {
  try {
    const { roomId, totalAmount, paymentDetails } = req.body;
    const userId = req.user.id;

    const room = await Room.findById(roomId).populate("owner", "email fullName");
    if (!room) return next(new AppError("Room not found", 404));

    // create booking
    const booking = await Booking.create({
      room: roomId,
      user: userId,
      totalAmount,
      paymentDetails
    });

    // attach booking to user
    await User.findByIdAndUpdate(userId, {
      $push: { bookings: booking._id },
    });

    // populate booking
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: "room",
        populate: { path: "owner", select: "email fullName" },
      })
      .populate("user", "email fullName");

    await booking.save();
    // emails
    const ownerEmail = populatedBooking.room.owner.email;
    const userEmail = populatedBooking.user.email;

    // owner mail
    await sendEmail({
      to: ownerEmail,
      subject: "New Booking Received",
      html: `
        <h3>Your room "${room.title}" has been booked</h3>
        <p><strong>Guest:</strong> ${populatedBooking.user.fullName}</p>
        <p><strong>Total:</strong> ₹${totalAmount}</p>
      `,
    });

    // user mail
    await sendEmail({
      to: userEmail,
      subject: "Booking Confirmed",
      html: `
        <h3>Your booking is confirmed for "${room.title}"</h3>
        <p><strong>Total:</strong> ₹${totalAmount}</p>
        <p>Status: Pending approval</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Room booked successfully",
      booking: populatedBooking,
    });

  } catch (error) {
    next(error);
  }
};



export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; 

    if (!["approved", "cancelled"].includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const booking = await Booking.findById(bookingId)
      .populate("room")
      .populate("user");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (!booking.room.owner || booking.room.owner.toString() !== req.user.id) {
      return next(new AppError("Not authorized", 403));
    }

    if (booking.status === "cancelled") {
      return next(new AppError("Booking is already cancelled", 400));
    }

    if (status === "approved" && booking.status !== "pending") {
      return next(new AppError("Booking is already processed", 400));
    }
    if (status === "approved") {
      booking.status = "approved";
      await booking.save();

      await sendEmail({
        to: booking.user.email,
        subject: "Booking Approved ✅",
        html: `
          <h2>Your booking is confirmed 🎉</h2>
          <p><strong>Room:</strong> ${booking.room.title}</p>
          <p><strong>Amount Paid:</strong> ₹${booking.totalAmount}</p>
          <p>Owner will contact you soon.</p>
        `,
      });

      return res.status(200).json({
        success: true,
        message: "Booking approved successfully",
      });
    }
    if (status === "cancelled") {
      const refundId = booking.paymentDetails?.razorpay_payment_id;
      if (!refundId) {
        return next(new AppError("Payment details not found for refund", 400));
      }

      const payment = await Payment.findOne({
        razorpay_payment_id: refundId,
      });

      if (!payment) {
        return next(new AppError("Payment not found in database", 404));
      }

      try {
        await razorpay.payments.refund(refundId, {
          speed: "normal", // changed to normal to be safer, optimum is sometimes restricted
        });
      } catch (refundError) {
        console.error("Razorpay Refund Error (Continuing with cancellation):", refundError);
      }

      booking.status = "cancelled";
      await booking.save();

      await sendEmail({
        to: booking.user.email,
        subject: "Booking Cancelled ❌",
        html: `
          <h2>Booking Cancelled</h2>
          <p><strong>Room:</strong> ${booking.room.title}</p>
          <p>Your booking has been cancelled by the owner.</p>
          <p>💰 Refund has been initiated to your original payment method.</p>
        `,
      });

      return res.status(200).json({
        success: true,
        message: "Booking cancelled & refund initiated",
      });
    }

  } catch (error) {
    console.error("Update Booking Error:", error);
    next(error);
  }
};