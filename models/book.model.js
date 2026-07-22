import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled", "rejected"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
     paymentDetails: {
      razorpay_payment_id: {
        type: String,   
      },
      razorpay_order_id: {
        type: String,
      },
    },
    
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
