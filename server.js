import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./src/routes/auth.js";
import attendanceRoutes from "./src/routes/attendance.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   Middlewares
========================= */
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Request Logger
========================= */
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

/* =========================
   MongoDB Connection
========================= */
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.warn("⚠ MONGO_URI not found in .env file");
} else {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
    })
    .catch((error) => {
      console.error("❌ MongoDB Connection Error:", error);
    });
}

/* =========================
   MongoDB Event Logs
========================= */
mongoose.connection.on("connected", () => {
  console.log("📦 Database connected");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ Database error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠ Database disconnected");
});

/* =========================
   API Routes
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

/* =========================
   Health Check
========================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    databaseConnected: mongoose.connection.readyState === 1,
    time: new Date()
  });
});

/* =========================
   API Not Found Handler
========================= */
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API route not found"
  });
});

/* =========================
   Static Frontend
========================= */
const frontendDir = path.join(process.cwd(), "frontend");

app.use(express.static(frontendDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "Home.html"));
});

app.get("/:page", (req, res) => {
  const pagePath = path.join(frontendDir, req.params.page);

  res.sendFile(pagePath, (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 Global Server Error:", err);

  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

/* =========================
   Start Server
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📂 Frontend folder: ${frontendDir}`);
  console.log("====================================");
});