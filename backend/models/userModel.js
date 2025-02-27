import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],
        minlength: [3, "Name must be at least 3 characters"],
    },
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    mobile: {
        type: Number,
        minlength: [10, "Mobile number must be at least 10 characters"],
        maxlength: [10, "Mobile number must be at most 10 characters"],
    },
    loginTime: {
        type: Date,
        required: true,
        default:Date.now,
    },
    logoutTime: {
        type: Date,
        default:Date.now,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
    loginOtp: {
        type: Number,
    },
    loginOtpExpire: {
        type: Date,
    },
    loginOtpAttempts: {
        type: Number,
        default: 0,
    },
    loginOtpAttemptsExpire: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: Number,
    },
    otpExpire: {
        type: Date,
    },
    otpAttempts: {
        type: Number,
        default: 0,
    },
    otpAttemptsExpire: {
        type: Date,
    },
    resetPassword: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
    // avatar: {
    //     public_id: {
    //         type: String,
    //         required: true,
    //         default: 'image'
    //     },
    //     url: {
    //         type: String,
    //         required: true,
    //         default: ''
    //     }
    // },
}, { timestamps: true });

// Pre-save middleware for hashing passwords
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate JWT token
userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

userSchema.index({ createdAt: 1 });

const User = mongoose.model("User", userSchema);
export default User;