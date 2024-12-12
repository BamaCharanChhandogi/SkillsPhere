import mongoose from "mongoose";
const PaymentSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String
}, { timestamps: true });

export const Payment = mongoose.model('Payment', PaymentSchema);