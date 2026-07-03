import mongoose from "mongoose";

const { Schema } = mongoose;

const AttendanceSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },

  subject: {
    type: String,
    required: true,
    trim: true
  },

  sessionID: {
    type: String,
    required: true,
    trim: true
  },

  studentName: {
    type: String,
    required: true,
    trim: true
  },

  enrollment: {
    type: String,
    required: true,
    trim: true
  },

  year: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ["present", "absent"],
    default: "present"
  },

  time: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate attendance for same student in same session
AttendanceSchema.index(
  { sessionID: 1, enrollment: 1 },
  { unique: true }
);

// Prevent model overwrite error
const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);

export default Attendance;