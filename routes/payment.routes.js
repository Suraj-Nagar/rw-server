import { Router } from 'express';
import {getRazorpayApiKey,cancelSubscription,allPayments, verifyPaymentAndBook, createOrder,} from '../controllers/payment.controller.js';
import { authorizeRoles, authorizeSubscribers,isLoggedIn,} from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/subscribe',isLoggedIn,createOrder);
router.post('/verify-and-book',isLoggedIn,verifyPaymentAndBook);
router.post('/unsubscribe',isLoggedIn, authorizeSubscribers, cancelSubscription);
router.get('/razorpay-key',isLoggedIn, getRazorpayApiKey);
router.get('/payments',isLoggedIn, authorizeRoles('ADMIN'), allPayments);
export default router;      