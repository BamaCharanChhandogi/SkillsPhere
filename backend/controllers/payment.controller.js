import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Job } from '../models/job.model.js';
import { Payment } from '../models/paymentModel.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createPaymentOrder = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.id;
        
        
        // Find the job and get application fee
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }
        
        // Check if payment already exists
        const existingPayment = await Payment.findOne({
            job: jobId,
            applicant: userId,
            status: 'SUCCESS'
        });
        
        if (existingPayment) {
            return res.status(400).json({
                message: "Payment already completed",
                success: false
            });
        }
        const shortReceipt = `job_${jobId}_${Date.now()}`.slice(0, 40);
        // Create Razorpay order
        const options = {
            amount: job.applicationFee * 100, // Convert to paisa
            currency: 'INR',
            receipt: shortReceipt
        };
        
        const order = await razorpay.orders.create(options);
        
        
        // Save payment record
        const payment = await Payment.create({
            job: jobId,
            applicant: userId,
            amount: job.applicationFee,
            status: 'PENDING',
            razorpayOrderId: order.id
        });

        res.status(200).json({
            success: true,
            order,
            payment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Payment order creation failed",
            success: false
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            jobId
        } = req.body;
        const userId = req.id;

        // Find the payment record
        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
            job: jobId,
            applicant: userId
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment record not found",
                success: false
            });
        }

        // Verify signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            payment.status = 'FAILED';
            await payment.save();

            return res.status(400).json({
                message: "Payment verification failed",
                success: false
            });
        }

        // Update payment status
        payment.status = 'SUCCESS';
        payment.razorpayPaymentId = razorpay_payment_id;
        await payment.save();

        res.status(200).json({
            message: "Payment verified successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Payment verification error",
            success: false
        });
    }
};