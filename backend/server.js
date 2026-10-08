require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Vercel sits behind a proxy. Without this, rate limiting sees the
// proxy IP instead of the real client IP.
app.set("trust proxy", 1);

// ─────────────────────────────────────────────────────────────
// CORS  (MUST be the first middleware so that every response,
// including preflight, 429s and errors, carries CORS headers)
// ─────────────────────────────────────────────────────────────

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

// Trims whitespace/quotes, removes trailing slashes, lowercases.
// Browsers send Origin without a trailing slash, so
// "https://app.vercel.app/" in CLIENT_URL must still match.
const normalizeOrigin = (value) =>
  String(value)
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "")
    .toLowerCase();

const buildAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_URL || "")
    .split(",")
    .map(normalizeOrigin)
    .filter((origin) => origin && origin !== "*");

  const origins = new Set(fromEnv);

  if (!isProduction) {
    DEV_ORIGINS.forEach((origin) => origins.add(origin));
  }

  if (isProduction && origins.size === 0) {
    console.warn(
      "[CORS] CLIENT_URL is not set in production. All browser origins will be rejected."
    );
  }

  return origins;
};

const allowedOrigins = buildAllowedOrigins();

// Requests without an Origin header (curl, server-to-server,
// same-origin) are not subject to CORS and are allowed.
const isOriginAllowed = (origin) =>
  !origin || allowedOrigins.has(normalizeOrigin(origin));

const corsOptions = {
  // Never throw here. Returning false simply omits the CORS headers,
  // so the browser blocks the call and we avoid an error path.
  origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
  ],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

// Handles preflight (OPTIONS) automatically and ends it with 204.
app.use(cors(corsOptions));

// Clear 403 for non-browser callers using a disallowed Origin.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && !isOriginAllowed(origin)) {
    console.warn(`[CORS] Blocked origin: ${origin}`);
    return res.status(403).json({
      message: "Origin not allowed by CORS policy",
    });
  }

  next();
});

// ─────────────────────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: isProduction ? undefined : false,
  })
);

// ─────────────────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────────────────

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login/signup attempts. Please try again later.",
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many upload attempts. Please try again later." },
});

app.use("/api/", generalLimiter);

// ─────────────────────────────────────────────────────────────
// Body Parsers
// (multipart/form-data is handled by multer on specific routes)
// ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─────────────────────────────────────────────────────────────
// Health checks (do not require the database)
// ─────────────────────────────────────────────────────────────

const DB_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    environment: process.env.NODE_ENV || "development",
    database: DB_STATES[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Forces a real DB connection + ping. Use this to debug MongoDB.
app.get("/api/health/db", async (req, res) => {
  try {
    await connectDB();
    await mongoose.connection.db.admin().ping();
    res.status(200).json({ success: true, database: "connected" });
  } catch (error) {
    console.error("Health DB check failed:", error.message);
    res.status(503).json({ success: false, database: "unavailable" });
  }
});

// ─────────────────────────────────────────────────────────────
// Database connection for all API routes (serverless-safe:
// cached promise in config/db.js, so no new connection per request).
// Runs AFTER cors, so a DB failure still returns CORS headers.
// ─────────────────────────────────────────────────────────────

const ensureDbConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    const err = new Error("Database connection failed");
    err.statusCode = 503;
    next(err);
  }
};

app.use("/api/v1", ensureDbConnection);

// ─────────────────────────────────────────────────────────────
// Route-specific rate limits
// ─────────────────────────────────────────────────────────────

app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/update-profile", uploadLimiter);

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/budget", budgetRoutes);

// ─────────────────────────────────────────────────────────────
// 404
// ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─────────────────────────────────────────────────────────────
// Centralized Error Handler
// CORS headers were already set by the cors() middleware above and
// are preserved on error responses.
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (process.env.NODE_ENV !== "test") {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }

  let statusCode = err.statusCode || err.status || 500;

  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  const message =
    statusCode >= 500 && isProduction
      ? statusCode === 503 && err.message === "Database connection failed"
        ? "Service temporarily unavailable. Please try again."
        : "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────────────────────────
// Local development only. On Vercel this file is imported by
// api/index.js, so require.main !== module and nothing listens.
// ─────────────────────────────────────────────────────────────

if (require.main === module) {
  const PORT = process.env.PORT || 8000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
}

module.exports = app;