const express = require("express");

const {
  loginUser,
  registerUser,
  getUserInfo,
  updateProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const {
  handleProfileImageUpload,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────

router.post("/login", loginUser);

// Accepts JSON or multipart/form-data with optional "profileImage".
// The image is uploaded by the server as part of registration, so
// there is no separate (and previously unauthenticated) upload route.
router.post("/register", handleProfileImageUpload, registerUser);

// ─────────────────────────────────────────────────────────────
// User (protected)
// ─────────────────────────────────────────────────────────────

router.get("/getUser", protect, getUserInfo);

// `protect` runs BEFORE multer so unauthenticated requests
// never get their files parsed.
router.put(
  "/update-profile",
  protect,
  handleProfileImageUpload,
  updateProfile
);

module.exports = router;