import { model, Schema } from 'mongoose';

const paymentSchema = new Schema(
  {
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_subscription_id: {
      type: String,
    },
    razorpay_signature: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = model('Payment', paymentSchema);

export default Payment;