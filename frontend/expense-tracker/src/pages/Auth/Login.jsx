import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });

      const token = response.data.token || response.data.data?.token;
      const user = response.data.user || response.data.data?.user;

      if (!token) throw new Error("Token not found in response");

      localStorage.setItem("token", token);
      updateUser(user);
      toast.success(`Welcome back, ${user?.fullName?.split(" ")[0] || ""}!`);
      navigate("/dashboard");
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Login failed. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="et-fade-in">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Sign in to your account to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-1">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 characters"
            type="password"
          />

          <button
            type="submit"
            disabled={loading}
            className="et-btn mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Don't have an account?{" "}
          <Link className="font-semibold text-primary hover:underline" to="/signup">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
