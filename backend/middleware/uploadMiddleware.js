const multer = require("multer");
const path = require("path");

// Vercel Functions reject request bodies larger than 4.5 MB before
// Express ever runs, so the usable image limit is below that.
// Change this single constant (and the frontend one) if you move to
// direct signed uploads to Cloudinary.
const MAX_IMAGE_SIZE_MB = 4;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const INVALID_TYPE_MESSAGE =
  "Only JPG, JPEG, PNG and WEBP images are allowed";

// memoryStorage: no disk access, required for Vercel/serverless.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    ALLOWED_MIME_TYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(ext)
  ) {
    return cb(null, true);
  }

  const error = new Error(INVALID_TYPE_MESSAGE);
  error.code = "INVALID_FILE_TYPE";
  return cb(error, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
    fields: 10,
  },
});

// MIME type and extension come from the client and can be faked.
// Check the real file signature (magic bytes) as well.
const hasValidImageSignature = (buffer) => {
  if (!buffer || buffer.length < 12) return false;

  const isJpeg =
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

  const isPng = buffer
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

  const isWebp =
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  return isJpeg || isPng || isWebp;
};

// Wraps multer so every upload error becomes a clear JSON response
// instead of a generic 500.
const handleProfileImageUpload = (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            message: `Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB`,
          });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            message: "Unexpected file field. Send the image as 'profileImage'",
          });
        }

        return res.status(400).json({
          message: "Invalid upload request",
        });
      }

      if (err.code === "INVALID_FILE_TYPE") {
        return res.status(400).json({ message: INVALID_TYPE_MESSAGE });
      }

      // Malformed multipart body etc.
      console.error("Upload parsing error:", err.message);
      return res.status(400).json({
        message: "Could not process the uploaded file",
      });
    }

    if (req.file && !hasValidImageSignature(req.file.buffer)) {
      return res.status(400).json({ message: INVALID_TYPE_MESSAGE });
    }

    next();
  });
};

module.exports = {
  handleProfileImageUpload,
  MAX_IMAGE_SIZE_MB,
};