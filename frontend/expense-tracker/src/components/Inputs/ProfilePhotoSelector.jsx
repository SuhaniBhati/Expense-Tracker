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
          className="relative w-24 h-24 flex items-center justify-center bg-violet-100 dark:bg-violet-900/30 rounded-3xl cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-all duration-200"
          onClick={() =>
            inputRef.current.click()
          }
        >
          <LuUser className="text-primary text-5xl" />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-xl absolute -bottom-2 -right-2 shadow-md hover:bg-purple-700 transition-colors"
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
            className="w-24 h-24 rounded-3xl object-cover shadow-lg"
          />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-xl absolute -bottom-2 -right-2 shadow-md hover:bg-red-600 transition-colors"
            onClick={handleRemoveImage}
          >
            <LuTrash2 className="text-sm" />
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
        Upload PNG, JPG, JPEG or WEBP image
      </p>
    </div>
  );
};

export default ProfilePhotoSelector;
