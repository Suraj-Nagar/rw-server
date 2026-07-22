import { Router } from "express";
import { getstat, getAllUsers, deleteUser, getAllBookings, deleteBooking } from "../controllers/adminController.js";
import { isLoggedIn, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all admin routes
router.use(isLoggedIn, authorizeRoles('ADMIN'));

router.get('/stat', getstat);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);
router.delete('/bookings/:id', deleteBooking);

export default router;