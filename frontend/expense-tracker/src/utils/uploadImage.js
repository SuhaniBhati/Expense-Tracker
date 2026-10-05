import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
  if (!imageFile) {
    throw new Error("No image selected");
  }

  const formData = new FormData();

  formData.append(
    "profileImage",
    imageFile
  );

  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.UPLOAD_IMAGE,
      formData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error uploading image:",
      error.response?.data || error.message
    );

    throw error;
  }
};

export default uploadImage;