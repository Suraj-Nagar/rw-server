import Booking from "../models/book.model.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";

export const getstat=async(req,res,next)=>{
    try {
        const allRoomCount=await Room.countDocuments();
        const allUserCount=await User.countDocuments();
        const allBookingCount=await Booking.countDocuments();

        res.status(200).json({
            allBookingCount,
            allRoomCount,
            allUserCount,
        });
    } catch (error) {
        res.status(500).json({message:"Dashboard stats error"});
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting user" });
    }
};

export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'fullName email avatar')
            .populate('room', 'title rent images');
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching bookings" });
    }
};

export const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.status(200).json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting booking" });
    }
};