import express from "express";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   1. MARK ATTENDANCE
========================= */
router.post("/mark", async (req, res) => {
  try {
    const { subject, sessionID, enrollment, studentName, year } = req.body;

    if (!subject || !sessionID || !enrollment || !studentName || !year) {
      return res.status(400).json({
        error:
          "Subject, sessionID, enrollment, studentName, and year are required."
      });
    }

    // Check duplicate attendance
    const alreadyMarked = await Attendance.findOne({
      sessionID,
      enrollment: enrollment.trim()
    });

    if (alreadyMarked) {
      return res.status(400).json({
        error: "Attendance already marked for this class session!"
      });
    }

    // Current time
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const record = new Attendance({
      subject: subject.trim(),
      sessionID: sessionID.toString(),
      studentName: studentName.trim(),
      enrollment: enrollment.trim(),
      year: year.trim(),
      status: "present",
      time: timeString,
      date: now
    });

    await record.save();

    return res.status(201).json({
      message: "Attendance marked successfully ✅",
      record
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({
      error: "Internal server error marking attendance."
    });
  }
});

/* =========================
   2. GET STUDENT RECORDS
========================= */
router.get("/student", async (req, res) => {
  try {
    const { enrollment, status } = req.query;

    if (!enrollment) {
      return res.status(400).json({
        error: "Enrollment query parameter is required."
      });
    }

    const query = {
      enrollment: enrollment.trim()
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    const totalClasses = records.length;
    const presentCount = records.filter(
      (r) => r.status === "present"
    ).length;

    const absentCount = records.filter(
      (r) => r.status === "absent"
    ).length;

    const attendancePercent =
      totalClasses > 0
        ? parseFloat(((presentCount / totalClasses) * 100).toFixed(1))
        : 0;

    return res.status(200).json({
      records,
      stats: {
        totalClasses,
        presentCount,
        absentCount,
        attendancePercent
      }
    });
  } catch (error) {
    console.error("Error fetching student records:", error);
    return res.status(500).json({
      error: "Internal server error fetching student records."
    });
  }
});

/* =========================
   3. GET TEACHER RECORDS
========================= */
router.get("/teacher", async (req, res) => {
  try {
    const { period, year } = req.query;
    const query = {};

    // Year filter
    if (year && year !== "all") {
      let searchYearStr = `${year}st Year`;

      if (year === "2") searchYearStr = "2nd Year";
      if (year === "3") searchYearStr = "3rd Year";
      if (year === "4") searchYearStr = "4th Year";

      query.$or = [{ year: year }, { year: searchYearStr }];
    }

    // Date filters
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    if (period && period !== "all") {
      if (period === "today") {
        query.date = { $gte: startOfToday };
      } else if (period === "yesterday") {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        query.date = {
          $gte: startOfYesterday,
          $lt: startOfToday
        };
      } else if (period === "week") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        query.date = { $gte: sevenDaysAgo };
      } else if (period === "month") {
        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        query.date = { $gte: startOfMonth };
      } else if (period === "year") {
        const startOfYear = new Date(
          now.getFullYear(),
          0,
          1
        );

        query.date = { $gte: startOfYear };
      }
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    const totalStudents = records.length;

    const presentCount = records.filter(
      (r) => r.status === "present"
    ).length;

    const absentCount = records.filter(
      (r) => r.status === "absent"
    ).length;

    const sessionCount = [
      ...new Set(records.map((r) => r.sessionID))
    ].length;

    return res.status(200).json({
      records,
      stats: {
        totalStudents,
        presentCount,
        absentCount,
        sessionCount
      }
    });
  } catch (error) {
    console.error("Error fetching teacher records:", error);
    return res.status(500).json({
      error: "Internal server error fetching teacher records."
    });
  }
});

export default router;