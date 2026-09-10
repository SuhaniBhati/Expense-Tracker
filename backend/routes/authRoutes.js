const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getUserInfo,
  updateProfile,
  getProfileImage,
} = require("../controllers/authController");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/getUser", protect, getUserInfo);

router.put("/update-profile", protect, updateProfile);

// Authenticated image streaming
router.get("/profile-image/:filename", protect, getProfileImage);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/profile-image/${
    req.file.filename
  }`;

  res.status(200).json({
    message: "File uploaded successfully",
    imageUrl,
  });
});

module.exports = router;