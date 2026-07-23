import AppError from '../utils/AppError.js';
import User from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import Booking from '../models/book.model.js';
const cookieOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};
export const register = async (req, res, next) => {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) return next(new AppError("all feilds are required", 400));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new AppError("Invalid email format", 400));
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
        return next(
            new AppError(
                "Password must be 8+ chars with uppercase, lowercase, number & special character",
                400
            )
        );
    }

    const userExists = await User.findOne({ email });
    if (userExists) return next(new AppError("email already exist"));
    let newAvatar = null;
    if (req.files && req.files.avatar) {
        const cloudinaryresponse = await uploadOnCloudinary(req.files.avatar[0].path);
        if (!cloudinaryresponse) return next(new AppError("image upload failed"));
        newAvatar = {
            public_id: cloudinaryresponse.public_id,
            url: cloudinaryresponse.secure_url
        }
    }
    const newUser = await User.create({
        fullName,
        email,
        password,
        avatar: newAvatar,
        role,
    });
    if (!newUser) return next(new AppError("user not created", 404));
    await newUser.save();
    const token = await newUser.generateJWTToken();
    newUser.password = undefined;
    res.cookie('token', token, cookieOptions);
    res.status(200).json({
        success: true,
        message: 'user registered successfully',
        newUser,

    });


}
export const login = async (req, res, next) => {

    const { email, password } = req.body;


    if (!email || !password) {
        return next(new AppError('All fields are required', 400));
    }


    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new AppError("Invalid email or password", 400));
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return next(new AppError("Invalid email or password", 400));
    }

    const token = await user.generateJWTToken();

    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        message: 'user logged in successfully',
        user,
    });


};

export const logout = async (_req, res, _next) => {
    res.cookie('token', null, {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 0,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({
        success: true,
        message: 'User logged out successfully',
    });
}

import Room from '../models/room.model.js';

export const getProfile = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        return next(new AppError("unauthorized", 401));
    }
    const user = await User.findById(userId).select("-password")
        .populate({
            path: "bookings",
            populate: [
                { path: "room", model: "Room" },
                { path: "user", model: "User", select: "-password" }
            ],
        })
        .populate("wishlist");

    if (!user) {
        return next(new AppError("user not found", 404));
    }

    let ownedRooms = [];
    let hostBookings = [];
    if (user.role === 'ROWNER') {
        ownedRooms = await Room.find({ owner: userId });
        
        const roomIds = ownedRooms.map(r => r._id);
        hostBookings = await Booking.find({ room: { $in: roomIds } })
            .populate("room")
            .populate("user");
    }

    res.set("Cache-Control", "no-store");

    res.status(200).json({
        success: true,
        message: "user profile successfully",
        user: {
            ...user.toObject(),
            ownedRooms,
            hostBookings
        }
    });
}

export const updateProfile = async (req, res, next) => {
    try {
        const { fullName, aadharNumber, collegeName, emergencyContact, accountName, accountNumber, ifscCode, razorpayAccountId } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return next(new AppError("User not found", 404));

        if (fullName) {
            user.fullName = fullName;
        }
        if (aadharNumber) user.aadharNumber = aadharNumber;
        if (collegeName) user.collegeName = collegeName;
        if (emergencyContact) user.emergencyContact = emergencyContact;
        
        if (accountName || accountNumber || ifscCode) {
            user.bankDetails = {
                accountName: accountName || user.bankDetails?.accountName,
                accountNumber: accountNumber || user.bankDetails?.accountNumber,
                ifscCode: ifscCode || user.bankDetails?.ifscCode,
            };
        }
        
        if (razorpayAccountId) user.razorpayAccountId = razorpayAccountId;

        if (req.files && req.files.avatar) {
            const cloudinaryResponse = await uploadOnCloudinary(req.files.avatar[0].path);
            if (!cloudinaryResponse) return next(new AppError("Avatar upload failed", 500));
            user.avatar = { public_id: cloudinaryResponse.public_id, url: cloudinaryResponse.secure_url };
        }

        if (req.files && req.files.aadharFront) {
            const cloudinaryResponse = await uploadOnCloudinary(req.files.aadharFront[0].path);
            if (!cloudinaryResponse) return next(new AppError("Aadhar front upload failed", 500));
            user.aadharFront = { public_id: cloudinaryResponse.public_id, secure_url: cloudinaryResponse.secure_url };
        }

        if (req.files && req.files.aadharBack) {
            const cloudinaryResponse = await uploadOnCloudinary(req.files.aadharBack[0].path);
            if (!cloudinaryResponse) return next(new AppError("Aadhar back upload failed", 500));
            user.aadharBack = { public_id: cloudinaryResponse.public_id, secure_url: cloudinaryResponse.secure_url };
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export const toggleWishlist = async (req, res, next) => {
    try {
        const { roomId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return next(new AppError("User not found", 404));

        const roomIndex = user.wishlist.findIndex((id) => id.toString() === roomId);

        let isAdded = false;
        if (roomIndex === -1) {
            user.wishlist.push(roomId);
            isAdded = true;
        } else {
            user.wishlist.splice(roomIndex, 1);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: isAdded ? "Room added to wishlist" : "Room removed from wishlist",
            wishlist: user.wishlist
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};