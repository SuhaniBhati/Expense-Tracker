const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

// ─────────────────────────────────────────────────────────────
// Generate JWT
// ─────────────────────────────────────────────────────────────

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ─────────────────────────────────────────────────────────────
// Upload image buffer to Cloudinary
// ─────────────────────────────────────────────────────────────

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "expense-tracker/profile-images",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(buffer);
  });
};

// ─────────────────────────────────────────────────────────────
// Delete image from Cloudinary
// ─────────────────────────────────────────────────────────────

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error(
      "Cloudinary image deletion failed:",
      error.message
    );
  }
};

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────

exports.registerUser = async (req, res) => {
  const {
    fullName,
    email,
    password,
    profileImageUrl,
    profileImagePublicId,
  } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields",
    });
  }

  const cleanFullName =
    typeof fullName === "string"
      ? fullName.trim()
      : "";

  const cleanEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

  if (
    cleanFullName.length < 2 ||
    cleanFullName.length > 100
  ) {
    return res.status(400).json({
      message:
        "Full name must be between 2 and 100 characters",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      message: "Please provide a valid email address",
    });
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return res.status(400).json({
      message:
        "Password must be between 8 and 128 characters",
    });
  }

  try {
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const user = await User.create({
      fullName: cleanFullName,
      email: cleanEmail,
      password,

      // Cloudinary profile image
      profileImageUrl: profileImageUrl || null,
      profileImagePublicId:
        profileImagePublicId || null,
    });

    const safeUser = user.toJSON();

    return res.status(201).json({
      id: user._id,
      user: safeUser,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Registration error:", err);

    return res.status(500).json({
      message: "Error registering user",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const cleanEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

  try {
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (
      !user ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const safeUser = user.toJSON();

    return res.status(200).json({
      id: user._id,
      user: safeUser,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Error logging in",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Get user info
// ─────────────────────────────────────────────────────────────

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Get user info error:", err);

    return res.status(500).json({
      message: "Error fetching user info",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Upload Profile Image
// ─────────────────────────────────────────────────────────────
// IMPORTANT:
// This endpoint is intentionally NOT protected.
// It is used during signup BEFORE the user has a JWT.
//
// Flow:
// Frontend → Multer → Cloudinary → return imageUrl/publicId
// The actual user is created later during registration.
// ─────────────────────────────────────────────────────────────

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer
    );

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error(
      "Profile image upload error:",
      err
    );

    return res.status(500).json({
      message: "Error uploading profile image",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Update Profile
// ─────────────────────────────────────────────────────────────

exports.updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      removeProfileImage,
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ─────────────────────────────────────────────
    // Update name
    // ─────────────────────────────────────────────

    if (fullName !== undefined) {
      if (
        typeof fullName !== "string" ||
        fullName.trim().length < 2 ||
        fullName.trim().length > 100
      ) {
        return res.status(400).json({
          message:
            "Name must contain between 2 and 100 characters",
        });
      }

      user.fullName = fullName.trim();
    }

    // ─────────────────────────────────────────────
    // Remove profile image
    // ─────────────────────────────────────────────

    if (removeProfileImage === true) {
      if (user.profileImagePublicId) {
        await deleteFromCloudinary(
          user.profileImagePublicId
        );
      }

      user.profileImageUrl = null;
      user.profileImagePublicId = null;
    }

    await user.save();

    const updatedUser = await User.findById(
      user._id
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);

    return res.status(500).json({
      message: "Error updating profile",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    });
  }
};

