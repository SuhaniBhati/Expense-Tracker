const User = require("../models/User");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register
exports.registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const cleanFullName = typeof fullName === "string" ? fullName.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (cleanFullName.length < 2 || cleanFullName.length > 100) {
    return res.status(400).json({ message: "Full name must be between 2 and 100 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }

  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 8 and 128 characters" });
  }

  try {
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const cleanProfileImageUrl = typeof profileImageUrl === "string" ? profileImageUrl.trim().slice(0, 500) : null;

    const user = await User.create({
      fullName: cleanFullName,
      email: cleanEmail,
      password,
      profileImageUrl: cleanProfileImageUrl,
    });

    // Ensure password is never exposed
    const safeUser = user.toJSON ? user.toJSON() : {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    delete safeUser.password;

    res.status(201).json({
      id: user._id,
      user: safeUser,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error registering user",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  try {
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Ensure password is never exposed
    const safeUser = user.toJSON ? user.toJSON() : {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    delete safeUser.password;

    res.status(200).json({
      id: user._id,
      user: safeUser,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error logging in",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    });
  }
};

// Get user info
exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user info",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, profileImageUrl, removeProfileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (fullName !== undefined) {
      if (typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100) {
        return res.status(400).json({
          message: "Name must contain between 2 and 100 characters",
        });
      }
      user.fullName = fullName.trim();
    }

    // Remove existing image if requested
    if (removeProfileImage === true) {
      if (user.profileImageUrl) {
        try {
          const rawName = user.profileImageUrl.includes("/profile-image/")
            ? user.profileImageUrl.split("/profile-image/")[1]
            : user.profileImageUrl.split("/uploads/")[1] || path.basename(user.profileImageUrl);

          if (rawName) {
            // Path traversal prevention: sanitize filename to base name only
            const safeFileName = path.basename(rawName);
            const imagePath = path.join(
              __dirname,
              "..",
              "uploads",
              safeFileName
            );

            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        } catch (error) {
          // Log locally only
        }
      }

      user.profileImageUrl = null;
    }

    if (profileImageUrl && typeof profileImageUrl === "string") {
      user.profileImageUrl = profileImageUrl.trim().slice(0, 500);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating profile",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    });
  }
};

const ALLOWED_IMAGE_EXTENSIONS = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const SAFE_IMAGE_FILENAME_REGEX = /^[a-zA-Z0-9_\-\.]+$/;

// Get Profile Image (Authenticated streaming)
exports.getProfileImage = (req, res) => {
  const rawFilename = req.params.filename;

  if (!rawFilename || typeof rawFilename !== "string") {
    return res.status(400).json({ message: "Invalid filename" });
  }

  const sanitized = path.basename(rawFilename);

  // Prevent directory traversal: reject if sanitized differs or contains traversal sequences
  if (
    sanitized !== rawFilename ||
    rawFilename.includes("..") ||
    rawFilename.includes("/") ||
    rawFilename.includes("\\") ||
    !SAFE_IMAGE_FILENAME_REGEX.test(sanitized)
  ) {
    return res.status(403).json({ message: "Access forbidden" });
  }

  // Extension validation against strict whitelist
  const ext = path.extname(sanitized).toLowerCase();
  const contentType = ALLOWED_IMAGE_EXTENSIONS[ext];
  if (!contentType) {
    return res.status(403).json({ message: "File type not supported" });
  }

  // Confinement check: verify canonical path is inside uploads directory
  const uploadsDir = path.resolve(__dirname, "../uploads");
  const targetPath = path.resolve(uploadsDir, sanitized);

  if (!targetPath.startsWith(uploadsDir + path.sep)) {
    return res.status(403).json({ message: "Access forbidden" });
  }

  // Check existence
  if (!fs.existsSync(targetPath)) {
    return res.status(404).json({ message: "Image not found" });
  }

  try {
    const stat = fs.statSync(targetPath);
    if (!stat.isFile()) {
      return res.status(404).json({ message: "Image not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error reading image" });
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, max-age=86400");

  res.sendFile(targetPath);
};