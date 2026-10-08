import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { LuUser, LuUpload, LuTrash2 } from "react-icons/lu";

// Keep in sync with MAX_IMAGE_SIZE_MB in backend uploadMiddleware.js
const MAX_IMAGE_SIZE_MB = 4;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Props
 *  image             File | null  - newly selected file (controlled by parent)
 *  setImage          fn           - set/clear the newly selected file
 *  existingImage     string|null  - saved image URL (parent passes null once
 *                                   the user has chosen to remove it)
 *  onRemoveExisting  fn (optional)- called when the user removes the SAVED image
 *  onSelectNew       fn (optional)- called when a valid new file is selected
 */
const ProfilePhotoSelector = ({
  image,
  setImage,
  existingImage,
  onRemoveExisting,
  onSelectNew,
}) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Derive the local preview from the selected file, and always revoke it.
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return undefined;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG and WEBP images are allowed");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(`Image must be smaller than ${MAX_IMAGE_SIZE_MB} MB`);
      event.target.value = "";
      return;
    }

    setImage(file);

    if (onSelectNew) {
      onSelectNew();
    }
  };

  const handleRemoveImage = () => {
    if (image) {
      // A new, unsaved selection is shown: just discard it.
      // The saved image is NOT touched.
      setImage(null);
      return;
    }

    // The saved image is shown: ask the parent to remove it on save.
    if (onRemoveExisting) {
      onRemoveExisting();
    }
  };

  const imageSource = previewUrl || existingImage;

  return (
    <div className="flex flex-col items-center mb-6">
      <input
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!imageSource ? (
        <div
          className="relative w-24 h-24 flex items-center justify-center bg-primary-soft rounded-3xl cursor-pointer hover:bg-primary/15 transition-all duration-200"
          onClick={() => inputRef.current?.click()}
        >
          <LuUser className="text-primary text-5xl" />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-xl absolute -bottom-2 -right-2 shadow-[var(--shadow-button)] hover:bg-primary-hover transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            aria-label="Upload profile photo"
          >
            <LuUpload className="text-sm" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={imageSource}
            alt="Profile"
            className="w-24 h-24 rounded-3xl object-cover shadow-[var(--shadow-card)] cursor-pointer"
            onClick={() => inputRef.current?.click()}
          />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-danger text-white rounded-xl absolute -bottom-2 -right-2 shadow-[var(--shadow-button)] hover:bg-danger/90 transition-colors"
            onClick={handleRemoveImage}
            aria-label="Remove profile photo"
          >
            <LuTrash2 className="text-sm" />
          </button>
        </div>
      )}

      <p className="text-xs text-ink-faint mt-3 text-center">
        PNG, JPG, JPEG or WEBP, up to {MAX_IMAGE_SIZE_MB} MB
      </p>
    </div>
  );
};

export default ProfilePhotoSelector;