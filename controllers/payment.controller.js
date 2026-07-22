import crypto from 'crypto';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import { razorpay } from '../config/razorpay.js';
import mongoose from 'mongoose';
import Payment from '../models/Payment.model.js';
import Room from '../models/room.model.js';
import Booking from '../models/book.model.js';
import { sendEmail } from '../utils/sendEmail.js';

// export const buySubscription = async (req, res, next) => {
//   try {
//     const { id } = req.user;
//     const user = await User.findById(id);
//     if (!user) {
//       return next(new AppError("Unauthorized, please login"));
//     }

//     if (user.role === "ADMIN") {
//       return next(new AppError("Admin cannot purchase a subscription", 400));
//     }

//     const subscription = await razorpay.subscriptions.create({
//       plan_id: process.env.RAZORPAY_PLAN_ID,
//       customer_notify: 1,
//       total_count: 12,
//     });

//     if (!user.subscription) {
//       user.subscription = {};
//     }
//     user.subscription.id = subscription.id;
//     user.subscription.status = subscription.status;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Subscribed successfully",
//       subscription_id: subscription.id,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// Verify Razorpay payment & create simple booking
// export const verifySubscriptionAndBook = async (req, res, next) => {
//   try {
//     const {
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       razorpay_signature,
//       roomId,
//       totalAmount,
//     } = req.body;

//     const user = await User.findById(req.user.id);
//     if (!user) return next(new AppError("Unauthorized", 401));

//     const room = await Room.findById(roomId).populate("owner", "email fullName");
//     if (!room) return next(new AppError("Room not found", 404));

//     // Verify Razorpay signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return next(new AppError("Payment verification failed", 400));
//     }

//     // Save payment details
//     await Payment.create({
//       user: user._id,
//       razorpay_payment_id,
//       razorpay_subscription_id,
//       razorpay_signature,
//       amount: totalAmount,
//     });

//     // Create booking
//     const booking = await Booking.create({
//       room: room._id,
//       user: user._id,
//       totalAmount,
//       paymentDetails: {
//         razorpay_payment_id,
//         razorpay_subscription_id,
//         razorpay_signature,
//       },
//     });

//     // Attach booking to user
//     user.bookings.push(booking._id);
//     await user.save();

//     // Send emails
//     await sendEmail({
//       to: room.owner.email,
//       subject: "New Booking Received",
//       html: `
//         <h3>Your room "${room.title}" has been booked</h3>
//         <p><strong>Guest:</strong> ${user.fullName}</p>
//         <p><strong>Total:</strong> ₹${totalAmount}</p>
//       `,
//     });

//     await sendEmail({
//       to: user.email,
//       subject: "Booking Confirmed",
//       html: `
//         <h3>Your booking for "${room.title}" is confirmed.</h3>
//         <p><strong>Total:</strong> ₹${totalAmount}</p>
//         <p>Status: Pending owner approval</p>
//       `,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Room booked successfully!",
//       bookingId: booking._id,
//     });
//   } catch (err) {
//     console.error("Booking Error:", err);
//     next(err);
//   }
// };

// export const verifyPaymentAndBook = async (req, res, next) => {

//   console.log("verify chal rha hai ");

//   try {
//     const {
//       razorpay_subscription_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       roomId,
//       totalAmount,
//     } = req.body;

//     /* ------------------ Validation ------------------ */
//     if (
//       !razorpay_subscription_id ||
//       !razorpay_payment_id ||
//       !razorpay_signature ||
//       !roomId ||
//       !totalAmount
//     ) {
//       return next(new AppError("Missing payment details", 400));
//     }

//     const user = await User.findById(req.user.id);
//     console.log(user);

//     if (!user) return next(new AppError("Unauthorized", 401));

//     const room = await Room.findById(roomId).populate("owner", "email fullName");
//     if (!room) return next(new AppError("Room not found", 404));

//     /* ------------------ Verify Razorpay Signature ------------------ */
//     const body = `${razorpay_subscription_id}|${razorpay_payment_id}`;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return next(new AppError("Payment verification failed", 400));
//     }

//     /* ------------------ Save Payment ------------------ */
//     const payment = await Payment.create({
//       user: user._id,
//       room: room._id,
//       razorpay_subscription_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       totalAmount,
//       status: "success",
//       paymentMethod: "razorpay",
//     });
//     console.log(payment);

//     /* ------------------ Create Booking ------------------ */
//     const booking = await Booking.create({
//       room: room._id,
//       user: user._id,
//       owner: room.owner._id,
//       totalAmount,
//       status: "confirmed",
//       payment: payment._id,
//     });

//     /* ------------------ Attach Booking to User ------------------ */
//     user.bookings.push(booking._id);
//     await user.save();

//     /* ------------------ Emails ------------------ */

//     // Owner email
//     await sendEmail({
//       to: room.owner.email,
//       subject: "New Room Booking - RoomWallah",
//       html: `
//         <h2>New Booking Received</h2>
//         <p><strong>Room:</strong> ${room.title}</p>
//         <p><strong>Student:</strong> ${user.fullName}</p>
//         <p><strong>Email:</strong> ${user.email}</p>
//         <p><strong>Amount:</strong> ₹${totalAmount}</p>
//         <p>Status: Payment Confirmed</p>
//       `,
//     });

//     // Student email
//     await sendEmail({
//       to: user.email,
//       subject: "Booking Confirmed - RoomWallah",
//       html: `
//         <h2>Booking Successful 🎉</h2>
//         <p>Your room <strong>${room.title}</strong> has been booked.</p>
//         <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
//         <p>The owner will contact you for check-in and room shifting.</p>
//         <p>Thank you for using RoomWallah ❤️</p>
//       `,
//     });

//     /* ------------------ Response ------------------ */
//     res.status(201).json({
//       success: true,
//       message: "Room booked successfully",
//       bookingId: booking._id,
//     });
//   } catch (error) {
//     console.error("❌ Verify & Book Error:", error);
//     next(error);
//   }
// };


export const createOrder = async (req, res, next) => {
  try {
    const { roomId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return next(new AppError("Invalid Room ID", 400));
    }

    const room = await Room.findById(roomId);
    if (!room) return next(new AppError("Room not found", 404));

    // Prevent creating an order if the user already has an active booking for this room
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      room: roomId,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return next(new AppError("You have already booked this room", 400));
    }

    // Prevent booking if the room has reached its bed capacity
    const activeBookingsCount = await Booking.countDocuments({
      room: roomId,
      status: { $in: ["pending", "approved"] }
    });

    if (activeBookingsCount >= (room.bedCapacity || 1)) {
       return next(new AppError("Sorry, this room is fully booked", 400));
    }

    const amount = room.rent;

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Math.random().toString(36).substring(2, 10)}`,
    };

    // RAZORPAY ROUTE: 7% Admin Commission / 93% Owner Payout
    const ownerUser = await User.findById(room.owner);
    if (ownerUser && ownerUser.razorpayAccountId) {
        const ownerPayout = Math.floor(amount * 100 * 0.93); // 93% in paise
        options.transfers = [
            {
                account: ownerUser.razorpayAccountId,
                amount: ownerPayout,
                currency: "INR",
                notes: { purpose: "Room Rent Payout" },
                on_hold: false // Transfer immediately upon capture
            }
        ];
    }

    const order = await razorpay.orders.create(options);

    console.log("Order created:", order.id);

    res.status(200).json({
      success: true,
      order,
      amount,
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    next(error);
  }
};


export const verifyPaymentAndBook = async (req, res, next) => {
  try {
    console.log("VERIFY BODY:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      roomId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return next(new AppError("Missing payment details", 400));
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(new AppError("Invalid payment signature", 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError("User not found", 404));

    const room = await Room.findById(roomId).populate("owner");
    if (!room) return next(new AppError("Room not found", 404));

    const existingBooking = await Booking.findOne({
      user: req.user.id,
      room: roomId,
      status: { $in: ["pending", "approved"] }
    });

    if (existingBooking) {
      return next(new AppError("You have already booked this room", 400));
    }

    const activeBookingsCount = await Booking.countDocuments({
      room: roomId,
      status: { $in: ["pending", "approved"] }
    });

    if (activeBookingsCount >= (room.bedCapacity || 1)) {
       return next(new AppError("Sorry, this room is fully booked", 400));
    }

    await Payment.create({
      user: req.user.id,
      room: roomId,
      razorpay_payment_id,
      razorpay_order_id,
      amount: room.rent,
      status: "success",
    });

    const booking = await Booking.create({
      user: req.user.id,
      room: roomId,
      totalAmount: room.rent,
      paymentDetails: {
        razorpay_payment_id,
        razorpay_order_id,
      },
      status: "pending"
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { bookings: booking._id },
    });

    try {
      if (room.owner && room.owner.email) {
        await sendEmail({
          to: room.owner.email,
          subject: "New Booking Received",
          html: `
            <h3>Your room "${room.title}" has been booked</h3>
            <p><strong>Guest:</strong> ${user.fullName}</p>
            <p><strong>Total:</strong> ₹${room.rent}</p>
          `,
        });
      }

      await sendEmail({
        to: user.email,
        subject: "Booking Confirmed",
        html: `
          <h3>Your booking for "${room.title}" is confirmed.</h3>
          <p><strong>Total:</strong> ₹${room.rent}</p>
          <p>Status: Pending owner approval</p>
        `,
      });
    } catch (emailError) {
      console.log("Email could not be sent (SMTP issue), but booking succeeded:", emailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified & booking successful",
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (user.role === 'ADMIN') {
    return next(
      new AppError('Admin cannot cancel subscription', 400)
    );
  }
  const subscriptionId = user.subscription.id;
  try {
    const subscription = await razorpay.subscriptions.cancel(
      subscriptionId
    );
    user.subscription.status = subscription.status;
    await user.save();
  } catch (error) {

    return next(new AppError(error.error.description, error.statusCode));
  }
  const payment = await Payment.findOne({
    razorpay_subscription_id: subscriptionId,
  });
  const timeSinceSubscribed = Date.now() - payment.createdAt;
  const refundPeriod = 14 * 24 * 60 * 60 * 1000;
  if (refundPeriod <= timeSinceSubscribed) {
    return next(
      new AppError(
        'Refund period is over, so there will not be any refunds provided.',
        400
      )
    );
  }
  await razorpay.payments.refund(payment.razorpay_payment_id, {
    speed: 'optimum',
  });

  user.subscription.id = undefined;
  user.subscription.status = undefined;

  await user.save();
  await payment.remove();
  res.status(200).json({
    success: true,
    message: 'Subscription canceled successfully',
  });
}
export const getRazorpayApiKey = async (_req, res, _next) => {
  res.status(200).json({
    success: true,
    message: 'Razorpay API key',
    key: process.env.RAZORPAY_KEY_ID,
  });
};
export const allPayments = async (req, res, _next) => {
  const { count, skip } = req.query;
  const allPayments = await razorpay.subscriptions.all({
    count: count ? count : 10,
    skip: skip ? skip : 0,
  });

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const finalMonths = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  const monthlyWisePayments = allPayments.items.map((payment) => {
    const monthsInNumbers = new Date(payment.start_at * 1000);
    return monthNames[monthsInNumbers.getMonth()];
  });

  monthlyWisePayments.map((month) => {
    Object.keys(finalMonths).forEach((objMonth) => {
      if (month === objMonth) {
        finalMonths[month] += 1;
      }
    });
  });

  const monthlySalesRecord = [];

  Object.keys(finalMonths).forEach((monthName) => {
    monthlySalesRecord.push(finalMonths[monthName]);
  });

  res.status(200).json({
    success: true,
    message: 'All payments',
    allPayments,
    finalMonths,
    monthlySalesRecord,
  });
}

