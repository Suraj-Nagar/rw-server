import express from "express";
import {createRoom,deleteRoom,getAllRooms,updateRoom,getRoom} from "../controllers/roomController.js";
import {isRoomOwnerOrAdmin} from "../middlewares/isRoomOwnerOrAdmin.js"
import {authorizeRoles,isLoggedIn} from '../middlewares/auth.middleware.js';
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();  
router.post(
  "/create",
  isLoggedIn,
  authorizeRoles("ROWNER", "ADMIN"),
  upload.array("images", 10),
  createRoom
);
router.delete(
  "/delete/:id",
  isLoggedIn,
  isRoomOwnerOrAdmin,
  deleteRoom
);
router.put(
  "/edit/:id",
  isLoggedIn,
  isRoomOwnerOrAdmin,
  upload.array("images", 10),
  updateRoom
);

router.get(
  "/getrooms",
  isLoggedIn,
  getAllRooms
);

router.get(
  "/:id",
  isLoggedIn,
  getRoom
);

export default router;