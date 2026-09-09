import React, { useContext, useState } from "react";
import Modal from "../Modal";
import ProfilePhotoSelector from "../Inputs/ProfilePhotoSelector";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import uploadImage from "../../utils/uploadImage";
import { API_PATHS } from "../../utils/apiPaths";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useContext(UserContext);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [image, setImage] = useState(null);

  const [removeImage, setRemoveImage] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");

      let imageUrl = user?.profileImageUrl || null;

      if (image) {
        const uploadResponse = await uploadImage(image);
        imageUrl = uploadResponse.imageUrl;
      }

      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        {
          fullName,
          profileImageUrl: removeImage ? null : imageUrl,
          removeProfileImage: removeImage,
        }
      );

      updateUserProfile(response.data.user);

      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-ink mb-6">
          Edit Profile
        </h2>

        <ProfilePhotoSelector
          image={image}
          setImage={setImage}
          existingImage={user?.profileImageUrl}
          onRemoveExisting={() => {
            setRemoveImage(true);
          }}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink-muted">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border border-line bg-input text-ink outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all"
            placeholder="Enter your full name"
          />
        </div>

        {error && (
          <p className="text-danger text-sm mt-4">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-line text-ink-muted hover:bg-hover transition-all"
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