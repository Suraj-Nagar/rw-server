import crypto from 'crypto';
import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'FullName is required'],
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please fill in a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "password must be at least 6 characters"],
            select: false,
        },
        avatar: {
            public_id: {
                type: String,
            },
            secure_url: {
                type: String,
            },
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN', 'ROWNER'],
            default: 'USER',
        },

        subscription: {
            id: {
                type: String,
            },
            status: {
                type: String,
                enum: ['created', 'active', 'cancelled', 'pending'],
            },
        },

        bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking",
            },
        ],

        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Room",
            },
        ],

        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,

        aadharNumber: {
            type: String,
            trim: true,
        },
        aadharFront: {
            public_id: { type: String },
            secure_url: { type: String },
        },
        aadharBack: {
            public_id: { type: String },
            secure_url: { type: String },
        },
        collegeName: {
            type: String,
            trim: true,
        },
        emergencyContact: {
            type: String,
            trim: true,
        },

        bankDetails: {
            accountName: { type: String, trim: true },
            accountNumber: { type: String, trim: true },
            ifscCode: { type: String, trim: true },
        },
        
        razorpayAccountId: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }


);
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
userSchema.methods = {
    comparePassword: async function (plainPassword) {
        return bcrypt.compare(plainPassword, this.password);
    },

    generateJWTToken: function () {
        return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY,
            }
        );
    },

    generatePasswordResetToken: async function () {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

        return resetToken;
    },
};
const User = model('User', userSchema);

export default User;