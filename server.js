import express from "express";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./src/routes/auth.js";
import attendanceRoutes from "./src/routes/attendance.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   Middlewares
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      console.error("❌ MongoDB Connection Error:", error.message);
    });
}

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
   Start Server
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log("====================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("====================================");
});