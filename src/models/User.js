import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
{
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    required: true,
    enum: ["student", "teacher"]
  },

  enrollment: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  },

  year: {
    type: String,
    trim: true
  },

  teacherCode: {
    type: String,
    trim: true,
    default: null
  },

  resetOtp: {
    type: String,
    default: null
  },

  resetOtpExpires: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
},
{
  timestamps: true
}
);

/* =========================
   AUTO CLEANUP OTP
========================= */

UserSchema.pre("save", function () {
  if (!this.resetOtp) {
    this.resetOtpExpires = null;
  }
});

/* =========================
   PREVENT MODEL OVERWRITE
========================= */

const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);

export default User;