import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from "dotenv";
import userRoute from './routes/userRoutes.js';
import roomRoute from './routes/roomRoutes.js';
import paymentRoute from './routes/payment.routes.js';
import bookingRoute from './routes/book.Routes.js';
import reviewRoute from './routes/reviewRoutes.js';
import messageRoute from './routes/messageRoutes.js';
import adminRoute from './routes/adminRoutes.js';
import cors from 'cors';
import morgan from 'morgan';
dotenv.config();
const app=express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://192.168.0.116:5173'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/api/v1/user',userRoute);
app.use('/api/v1/rooms',roomRoute);
app.use('/api/v1/payments',paymentRoute);
app.use('/api/v1/admin',adminRoute);
app.use('/api/v1/booking',bookingRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/messages', messageRoute);

export default app;