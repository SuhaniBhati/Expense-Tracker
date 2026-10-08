const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const PROFILE_IMAGE_FOLDER = "expense-tracker/profile-images";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const safeError = (err) =>
  process.env.NODE_ENV === "development" ? err.message : "Internal Server Error";

// multipart fields arrive as strings ("true"), JSON as booleans
const parseBoolean = (value) =>
  value === true || value === "true" || value === "1";

// Upload an in-memory buffer (multer memoryStorage) to Cloudinary
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: PROFILE_IMAGE_FOLDER,
        resource_type: "image",
        transformation: [{ width: 512, height: 512, crop: "limit" }],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Empty Cloudinary response"));
        resolve(result);
      }
    );

    stream.end(buffer);
  });

// Best-effort delete. Never throws: by the time this runs, the database
// is already consistent, and a failed cleanup must not fail the request.
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error("Cloudinary image deletion failed:", publicId, error.message);
  }
};

// ─────────────────────────────────────────────────────────────
// Register  (JSON or multipart/form-data with optional profileImage)
// ─────────────────────────────────────────────────────────────

exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body || {};

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields",
    });
  }

  const cleanFullName = typeof fullName === "string" ? fullName.trim() : "";
  const cleanEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (cleanFullName.length < 2 || cleanFullName.length > 100) {
    return res.status(400).json({
      message: "Full name must be between 2 and 100 characters",
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
      message: "Password must be between 8 and 128 characters",
    });
  }

  // Everything is validated BEFORE anything is uploaded, so a bad
  // form never creates a Cloudinary image.
  let uploadedImage = null;

  try {
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    if (req.file) {
      try {
        uploadedImage = await uploadToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error("Profile image upload failed:", uploadError.message);
        return res.status(502).json({
          message: "Profile image upload failed. Please try again.",
        });
      }
    }

    // NOTE: image fields are NEVER read from req.body. They only come
    // from our own Cloudinary upload, so clients cannot point a user at
    // an arbitrary public ID.
    const user = await User.create({
      fullName: cleanFullName,
      email: cleanEmail,
      password,
      profileImageUrl: uploadedImage ? uploadedImage.secure_url : null,
      profileImagePublicId: uploadedImage ? uploadedImage.public_id : null,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      id: user._id,
      user: user.toJSON(), // password stripped by schema transform
      token: generateToken(user._id),
    });
  } catch (err) {
    // Account was not created: remove the image we just uploaded
    // so nothing is orphaned in Cloudinary.
    if (uploadedImage) {
      await deleteFromCloudinary(uploadedImage.public_id);
    }

    if (err.code === 11000) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        message: first?.message || "Invalid registration data",
      });
    }

    console.error("Registration error:", err);

    return res.status(500).json({
      message: "Error registering user",
      error: safeError(err),
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

exports.loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      id: user._id,
      user: user.toJSON(),
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Error logging in",
      error: safeError(err),
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Get user info
// ─────────────────────────────────────────────────────────────

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Get user info error:", err);

    return res.status(500).json({
      message: "Error fetching user info",
      error: safeError(err),
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Update profile  (multipart/form-data)
//   fullName            optional
//   profileImage        optional file  -> replace image
//   removeProfileImage  optional "true" -> remove image
// If both a file and removeProfileImage are sent, the file wins.
// ─────────────────────────────────────────────────────────────

exports.updateProfile = async (req, res) => {
  let newUpload = null;

  try {
    const body = req.body || {};
    const { fullName } = body;
    const removeRequested = parseBoolean(body.removeProfileImage);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Validate everything first (before touching Cloudinary)
    const nameProvided = fullName !== undefined;

    if (nameProvided) {
      if (
        typeof fullName !== "string" ||
        fullName.trim().length < 2 ||
        fullName.trim().length > 100
      ) {
        return res.status(400).json({
          message: "Name must contain between 2 and 100 characters",
        });
      }

      user.fullName = fullName.trim();
    }

    if (!nameProvided && !req.file && !removeRequested) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const oldPublicId = user.profileImagePublicId;
    let deleteOldImage = false;

    if (req.file) {
      // 2a. REPLACE: upload the new image FIRST.
      // If this fails, the existing image is untouched.
      try {
        newUpload = await uploadToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error("Profile image upload failed:", uploadError.message);
        return res.status(502).json({
          message:
            "Profile image upload failed. Your current picture was not changed.",
        });
      }

      user.profileImageUrl = newUpload.secure_url;
      user.profileImagePublicId = newUpload.public_id;
      deleteOldImage = Boolean(oldPublicId);
    } else if (removeRequested) {
      // 2b. REMOVE
      user.profileImageUrl = null;
      user.profileImagePublicId = null;
      deleteOldImage = Boolean(oldPublicId);
    }

    // 3. Persist. If this throws, the catch below deletes the NEW upload,
    // and the old image (still referenced in MongoDB) is untouched.
    await user.save();
    newUpload = null; // saved successfully: do not clean it up

    // 4. Only now delete the old image from Cloudinary
    if (deleteOldImage) {
      await deleteFromCloudinary(oldPublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(), // never includes password
    });
  } catch (err) {
    if (newUpload) {
      await deleteFromCloudinary(newUpload.public_id);
    }

    console.error("Profile update error:", err);

    return res.status(500).json({
      message: "Error updating profile",
      error: safeError(err),
    });
  }
};
