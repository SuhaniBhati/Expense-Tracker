import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateFullName,
} from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateFullName(fullName)) {
      toast.error("Full name must be at least 3 characters");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters and contain a number"
      );
      return;
    }

    if (!validateConfirmPassword(password, confirmPassword)) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Single request: the server creates the account AND uploads the
      // optional image to Cloudinary. The field name "profileImage" must
      // match upload.single("profileImage") on the backend.
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("email", email.trim());
      formData.append("password", password);

      if (profilePic) {
        formData.append("profileImage", profilePic);
      }

      // No manual Content-Type header: the browser sets the multipart
      // boundary. Longer timeout because of cold start + image upload.
      const response = await axiosInstance.post(
        API_PATHS.AUTH.SIGNUP,
        formData,
        { timeout: 60000 }
      );

      const token = response.data.token || response.data.data?.token;
      const user = response.data.user || response.data.data?.user;

      if (!token) {
        throw new Error("Token not found in response");
      }

      localStorage.setItem("token", token);
      updateUser(user);

      toast.success(
        `Welcome, ${user?.fullName?.split(" ")[0] || ""}! Account created.`
      );

      navigate("/dashboard");
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.request && !error.response
          ? "Cannot reach the server. Please try again."
          : error.message) ||
        "Registration failed. Try again.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="et-fade-in">
        <h3 className="text-2xl font-bold text-ink mb-1">Create Account</h3>
        <p className="text-sm text-ink-muted mb-6">
          Join us today — it's free!
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John Doe"
              type="text"
            />
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />
            <div className="sm:col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 8 chars, include a number"
                type="password"
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                value={confirmPassword}
                onChange={({ target }) => setConfirmPassword(target.value)}
                label="Confirm Password"
                placeholder="Re-enter your password"
                type="password"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="et-btn disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </div>
        </form>

        <p className="text-sm text-ink-muted mt-5 text-center">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary hover:underline"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUp;