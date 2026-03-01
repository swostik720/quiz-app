import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        index: true,
    },
    isVerified: { type: Boolean, default: false },
    verifyEmailToken: String,
    verifyEmailTokenExpiry: Date,

    resetToken: String,
    resetTokenExpiry: Date,
},
    { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);

