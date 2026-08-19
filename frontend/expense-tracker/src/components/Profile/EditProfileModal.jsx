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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your full name"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-4">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;