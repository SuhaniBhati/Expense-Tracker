import React, { useState, useRef } from "react";
import {
  LuUser,
  LuUpload,
  LuTrash2,
} from "react-icons/lu";

const ProfilePhotoSelector = ({
  image,
  setImage,
  existingImage,
  onRemoveExisting,
}) => {
  const inputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(file);

      const preview =
        URL.createObjectURL(file);

      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);

    if (onRemoveExisting) {
      onRemoveExisting();
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const imageSource =
    previewUrl || existingImage;

  return (
    <div className="flex flex-col items-center mb-6">
      <input
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!imageSource ? (
        <div
          className="relative w-24 h-24 flex items-center justify-center bg-primary-soft rounded-3xl cursor-pointer hover:bg-primary/15 transition-all duration-200"
          onClick={() =>
            inputRef.current.click()
          }
        >
          <LuUser className="text-primary text-5xl" />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-xl absolute -bottom-2 -right-2 shadow-[var(--shadow-button)] hover:bg-primary-hover transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current.click();
            }}
          >
            <LuUpload className="text-sm" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={imageSource}
            alt="Profile"
            className="w-24 h-24 rounded-3xl object-cover shadow-[var(--shadow-card)]"
          />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-danger text-white rounded-xl absolute -bottom-2 -right-2 shadow-[var(--shadow-button)] hover:bg-danger/90 transition-colors"
            onClick={handleRemoveImage}
          >
            <LuTrash2 className="text-sm" />
          </button>
        </div>
      )}

      <p className="text-xs text-ink-faint mt-3 text-center">
        Upload PNG, JPG, JPEG or WEBP image
      </p>
    </div>
  );
};

export default ProfilePhotoSelector;
