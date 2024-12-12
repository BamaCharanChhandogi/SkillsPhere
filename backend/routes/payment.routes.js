import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { createPaymentOrder, verifyPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-order', isAuthenticated, createPaymentOrder);
router.post('/verify', isAuthenticated, verifyPayment);

export default router;