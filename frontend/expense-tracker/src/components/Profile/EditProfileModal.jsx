import React, { useContext, useEffect, useState } from "react";

import Modal from "../Modal";
import ProfilePhotoSelector from "../Inputs/ProfilePhotoSelector";

import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useContext(UserContext);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset the form every time the modal opens, so a cancelled edit
  // (selected file / "remove" click) never leaks into the next one.
  useEffect(() => {
    if (isOpen) {
      setFullName(user?.fullName || "");
      setImage(null);
      setRemoveImage(false);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = async () => {
    const trimmedName = fullName.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Name must contain between 2 and 100 characters");
      return;
    }

    const nameChanged = trimmedName !== (user?.fullName || "");
    const hasImageChange = Boolean(image) || (removeImage && !image);

    if (!nameChanged && !hasImageChange) {
      onClose();
      return;
    }

    try {
      setLoading(true);
      setError("");

      // One multipart request. Nothing is deleted or uploaded until Save.
      // Field name "profileImage" must match the backend multer field.
      const formData = new FormData();
      formData.append("fullName", trimmedName);

      if (image) {
        formData.append("profileImage", image);
      } else if (removeImage) {
        formData.append("removeProfileImage", "true");
      }

      // No manual Content-Type: the browser sets the multipart boundary.
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData,
        { timeout: 60000 }
      );

      const updatedUser = response.data.user;

      if (updatedUser) {
        updateUserProfile(updatedUser);
      }

      onClose();
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err?.response?.data?.message ||
          (err?.request && !err?.response
            ? "Cannot reach the server. Please try again."
            : "Something went wrong")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-ink mb-6">Edit Profile</h2>

        <ProfilePhotoSelector
          image={image}
          setImage={setImage}
          existingImage={removeImage ? null : user?.profileImageUrl}
          onRemoveExisting={() => setRemoveImage(true)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink-muted">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-line bg-input text-ink outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            placeholder="Enter your full name"
          />
        </div>

        {error && <p className="text-danger text-sm mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-line text-ink-muted hover:bg-hover transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;