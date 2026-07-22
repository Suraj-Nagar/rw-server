import { Router } from "express";
import { addReview, getRoomReviews } from "../controllers/reviewController.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:roomId", getRoomReviews);
router.post("/:roomId", isLoggedIn, addReview);

export default router;
