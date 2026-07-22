import{ Router} from 'express';
import {getProfile, login, logout, register, updateProfile, toggleWishlist} from '../controllers/userController.js'
import { upload } from '../middlewares/multer.middleware.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';
const router=Router();
const uploadFields = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 }
]);

router.post("/register", uploadFields, register);
router.post("/login",login);
router.get("/logout",logout);
router.get("/me",isLoggedIn,getProfile);
router.put("/update", isLoggedIn, uploadFields, updateProfile);
router.post("/wishlist/toggle", isLoggedIn, toggleWishlist);

export default router;