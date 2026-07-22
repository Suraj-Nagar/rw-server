import { Router } from "express";
import { getChatHistory, getChatContacts } from "../controllers/messageController.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/contacts", isLoggedIn, getChatContacts);
router.get("/:otherUserId", isLoggedIn, getChatHistory);

export default router;
