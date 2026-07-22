import { Router } from "express";
import { updateBookingStatus, bookRoom } from "../controllers/bookroomController.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router = Router();
router.post('/book/:id', isLoggedIn, bookRoom);
router.put("/:bookingId", isLoggedIn, updateBookingStatus);
export default router;