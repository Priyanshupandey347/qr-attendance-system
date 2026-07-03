// import express from "express";
// import crypto from "crypto";
// import User from "../models/User.js";

// const router = express.Router();

// /* =========================
//    PASSWORD HASH FUNCTION
// ========================= */
// function hashPassword(password) {
//   const salt = "qr_attendance_salt_2026";

//   return crypto
//     .createHash("sha256")
//     .update(password + salt)
//     .digest("hex");
// }

// /* =========================
//    SIGNUP
// ========================= */
// router.post("/signup", async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       password,
//       role,
//       enrollment,
//       year,
//       teacherCode
//     } = req.body;

//     if (!fullName || !email || !password || !role) {
//       return res.status(400).json({
//         error: "All fields are required."
//       });
//     }

//     // Check existing email
//     const existingUser = await User.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         error: "Email already registered."
//       });
//     }

//     // Teacher validation
//     if (role === "teacher") {
//       if (!teacherCode || teacherCode.trim() !== "2026") {
//         return res.status(400).json({
//           error: "Invalid teacher code."
//         });
//       }
//     }

//     // Student validation
//     if (role === "student") {
//       if (!enrollment || !year) {
//         return res.status(400).json({
//           error: "Enrollment and year are required."
//         });
//       }

//       const existingEnrollment = await User.findOne({
//         enrollment: enrollment.trim()
//       });

//       if (existingEnrollment) {
//         return res.status(400).json({
//           error: "Enrollment already exists."
//         });
//       }
//     }

//     const newUser = new User({
//       fullName: fullName.trim(),
//       email: email.toLowerCase().trim(),
//       passwordHash: hashPassword(password),
//       role,
//       enrollment: role === "student" ? enrollment.trim() : undefined,
//       year: role === "student" ? year.trim() : undefined,
//       teacherCode: role === "teacher" ? teacherCode.trim() : undefined
//     });

//     await newUser.save();

//     return res.status(201).json({
//       message: "Signup successful!",
//       user: {
//         id: newUser._id,
//         fullName: newUser.fullName,
//         email: newUser.email,
//         role: newUser.role
//       }
//     });

//   } catch (error) {
//     console.error("Signup Error:", error);
//     return res.status(500).json({
//       error: "Internal server error."
//     });
//   }
// });

// /* =========================
//    LOGIN
// ========================= */
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     if (!email || !password || !role) {
//       return res.status(400).json({
//         error: "Email, password and role are required."
//       });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase().trim(),
//       role
//     });

//     if (!user) {
//       return res.status(401).json({
//         error: "User not found."
//       });
//     }

//     const inputHash = hashPassword(password);

//     if (user.passwordHash !== inputHash) {
//       return res.status(401).json({
//         error: "Incorrect password."
//       });
//     }

//     return res.status(200).json({
//       message: "Login successful!",
//       user: {
//         id: user._id,
//         fullName: user.fullName,
//         email: user.email,
//         role: user.role,
//         enrollment: user.enrollment,
//         year: user.year
//       }
//     });

//   } catch (error) {
//     console.error("Login Error:", error);
//     return res.status(500).json({
//       error: "Internal server error."
//     });
//   }
// });

// /* =========================
//    FORGOT PASSWORD
// ========================= */
// router.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         error: "Email is required."
//       });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase().trim()
//     });

//     if (!user) {
//       return res.status(404).json({
//         error: "User not found."
//       });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     const expiry = new Date();
//     expiry.setMinutes(expiry.getMinutes() + 10);

//     user.resetOtp = otp;
//     user.resetOtpExpires = expiry;

//     await user.save();

//     console.log(`OTP for ${email}: ${otp}`);

//     return res.status(200).json({
//       message: "OTP generated successfully!",
//       otp
//     });

//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     return res.status(500).json({
//       error: "Internal server error."
//     });
//   }
// });

// /* =========================
//    VERIFY OTP
// ========================= */
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//       return res.status(400).json({
//         error: "Email and OTP are required."
//       });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase().trim(),
//       resetOtp: otp,
//       resetOtpExpires: { $gt: new Date() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         error: "Invalid or expired OTP."
//       });
//     }

//     return res.status(200).json({
//       message: "OTP verified successfully!"
//     });

//   } catch (error) {
//     console.error("Verify OTP Error:", error);
//     return res.status(500).json({
//       error: "Internal server error."
//     });
//   }
// });

// /* =========================
//    RESET PASSWORD
// ========================= */
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     if (!email || !otp || !newPassword) {
//       return res.status(400).json({
//         error: "Email, OTP and new password are required."
//       });
//     }

//     const user = await User.findOne({
//       email: email.toLowerCase().trim(),
//       resetOtp: otp,
//       resetOtpExpires: { $gt: new Date() }
//     });

//     if (!user) {
//       return res.status(400).json({
//         error: "Invalid or expired OTP."
//       });
//     }

//     user.passwordHash = hashPassword(newPassword);
//     user.resetOtp = undefined;
//     user.resetOtpExpires = undefined;

//     await user.save();

//     return res.status(200).json({
//       message: "Password reset successfully!"
//     });

//   } catch (error) {
//     console.error("Reset Password Error:", error);
//     return res.status(500).json({
//       error: "Internal server error."
//     });
//   }
// });

// export default router;









import express from "express";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   PASSWORD HASH FUNCTION
========================= */
function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || "qr_attendance_salt_2026";

  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

/* =========================
   SIGNUP
========================= */
router.post("/signup", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      enrollment,
      year,
      teacherCode
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "All fields are required."
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already registered."
      });
    }

    /* Teacher Validation */
    if (role === "teacher") {
      if (!teacherCode || teacherCode.trim() !== "2026") {
        return res.status(400).json({
          success: false,
          error: "Invalid teacher code."
        });
      }
    }

    /* Student Validation */
    if (role === "student") {
      if (!enrollment || !year) {
        return res.status(400).json({
          success: false,
          error: "Enrollment and year are required."
        });
      }

      const existingEnrollment = await User.findOne({
        enrollment: enrollment ? enrollment.trim() : null
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          error: "Enrollment already exists."
        });
      }
    }

    /* Create User */
    const newUser = new User({
      fullName: fullName ? fullName.trim() : "",
      email: cleanEmail,
      passwordHash: hashPassword(password),
      role,
      enrollment: role === "student"
        ? (enrollment ? enrollment.trim() : null)
        : null,
      year: role === "student"
        ? (year ? year.trim() : null)
        : null,
      teacherCode: role === "teacher"
        ? (teacherCode ? teacherCode.trim() : null)
        : null
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Signup successful!",
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Signup Full Error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error."
    });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "Email, password and role are required."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found."
      });
    }

    const inputHash = hashPassword(password);

    if (user.passwordHash !== inputHash) {
      return res.status(401).json({
        success: false,
        error: "Incorrect password."
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        enrollment: user.enrollment,
        year: user.year
      }
    });

  } catch (error) {
    console.error("Login Full Error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error."
    });
  }
});

/* =========================
   FORGOT PASSWORD
========================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;

    await user.save();

    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "OTP generated successfully!",
      otp
    });

  } catch (error) {
    console.error("Forgot Password Full Error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error."
    });
  }
});

/* =========================
   VERIFY OTP
========================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetOtp: otp,
      resetOtpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP."
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully!"
    });

  } catch (error) {
    console.error("Verify OTP Full Error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error."
    });
  }
});

/* =========================
   RESET PASSWORD
========================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Email, OTP and new password are required."
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetOtp: otp,
      resetOtpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP."
      });
    }

    user.passwordHash = hashPassword(newPassword);
    user.resetOtp = null;
    user.resetOtpExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully!"
    });

  } catch (error) {
    console.error("Reset Password Full Error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Internal server error."
    });
  }
});

export default router;