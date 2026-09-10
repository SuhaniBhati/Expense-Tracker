require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// ── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows profile images to load across domains
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);

// ── Rate Limiting ────────────────────────────────────────────────────────────
// General API limiter: 300 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Stricter limiter for authentication: 20 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login/signup attempts. Please try again later." },
});

// Stricter limiter for uploads: 30 uploads per 15 minutes
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many upload attempts. Please try again later." },
});

app.use("/api/", generalLimiter);

// ── CORS ─────────────────────────────────────────────────────────────────────
const getAllowedOrigins = () => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.split(",").map((url) => url.trim());
  }
  // Development default
  return ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Routes with specific rate limiters ────────────────────────────────────────
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/upload-image", uploadLimiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/budget", budgetRoutes);

// ── Authenticated profile image access for legacy /uploads paths ─────────────
// express.static has been completely removed to prevent unauthenticated access.
const { getProfileImage } = require("./controllers/authController");
const { protect } = require("./middleware/authMiddleware");

app.get("/uploads/:filename", protect, getProfileImage);

// ── Centralized Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Safe server-side error logging
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }

  const statusCode = err.status || (err.message === "CORS not allowed for this origin" ? 403 : 500);

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Server ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = { app, server };