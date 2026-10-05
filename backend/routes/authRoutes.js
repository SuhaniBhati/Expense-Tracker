const express = require("express");

const {
  loginUser,
  registerUser,
  getUserInfo,
  updateProfile,
  uploadProfileImage,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────

router.post("/login", loginUser);

router.post("/register", registerUser);

// ─────────────────────────────────────────────────────────────
// Profile Image
// ─────────────────────────────────────────────────────────────
// No `protect` here because the image is uploaded BEFORE
// the user account is created.

router.post(
  "/upload-image",
  upload.single("profileImage"),
  uploadProfileImage
);

// ─────────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────────

router.get(
  "/getUser",
  protect,
  getUserInfo
);

router.put(
  "/update-profile",
  protect,
  updateProfile
);

module.exports = router;