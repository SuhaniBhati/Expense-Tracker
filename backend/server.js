require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// ─────────────────────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
    contentSecurityPolicy:
      process.env.NODE_ENV === "production"
        ? undefined
        : false,
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
  skip: () => process.env.NODE_ENV !== "production",
  message: {
    message:
      "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many login/signup attempts. Please try again later.",
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many upload attempts. Please try again later.",
  },
});

app.use("/api/", generalLimiter);

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

const getAllowedOrigins = () => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ];
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          "CORS not allowed for this origin"
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ─────────────────────────────────────────────────────────────
// Body Parser
// ─────────────────────────────────────────────────────────────

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// ─────────────────────────────────────────────────────────────
// Rate-limited routes
// ─────────────────────────────────────────────────────────────

app.use(
  "/api/v1/auth/login",
  authLimiter
);

app.use(
  "/api/v1/auth/register",
  authLimiter
);

app.use(
  "/api/v1/auth/upload-image",
  uploadLimiter
);

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/income",
  incomeRoutes
);

app.use(
  "/api/v1/expense",
  expenseRoutes
);

app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);

app.use(
  "/api/v1/budget",
  budgetRoutes
);

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    environment:
      process.env.NODE_ENV || "development",
  });
});

// ─────────────────────────────────────────────────────────────
// Centralized Error Handler
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(
      `[${new Date().toISOString()}] Error:`,
      err.message
    );
  }

  let statusCode = 500;

  if (
    err.message ===
    "CORS not allowed for this origin"
  ) {
    statusCode = 403;
  }

  if (err.name === "MulterError") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message:
      err.message || "Internal Server Error",

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

// ─────────────────────────────────────────────────────────────

module.exports = app;