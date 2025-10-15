// src/pages/SignUpForm.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import toast from "react-hot-toast";

const statusToMessage = (status) => {
  switch (status) {
    case 400: return "Please check the details and try again.";
    case 401: return "You’re not authorized to do that.";
    case 409: return "An account with this email already exists.";
    case 422: return "Some fields are invalid. Please fix and try again.";
    case 429: return "Too many attempts. Please wait a moment and try again.";
    case 500: return "Something went wrong on our side. Please try again.";
    default: return "We couldn’t create your account. Please try again.";
  }
};

const validateClient = ({ name, email,phone, password, confirm, agree }) => {
  if (!name.trim()) return "Please enter your full name.";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email address.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password !== confirm) return "Passwords do not match.";
  if (!agree) return "Please accept Terms & Privacy.";
   const phoneRegex = /^[+\d\s\-\(\)]{7,15}$/;
  if (phone && !phoneRegex.test(phone.trim())) {
    return "Please enter a valid mobile number (7–15 digits).";
  }

  return null;
};

export default function SignUpForm() {
  const [name, setFullName]       = useState("");
  const [email, setEmail]         = useState("");
   const [phone, setPhone]   = useState(0);
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [showCP, setShowCP]       = useState(false);
  const [agree, setAgree]         = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // NEW

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({}); // clear per-submit

    const clientErr = validateClient({ name, email, phone, password, confirm, agree });
    if (clientErr) {
      setError(clientErr);
      toast.error(clientErr, { duration: 3500 });
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup({ name, email,phone, password });

      if (res?.ok) {
        toast.success("Signed up successfully!", { duration: 4000 });
        navigate("/login", { replace: true, state: { emailPrefill: email } });
      } else {
        // Use server-provided field errors if available
        if (res?.fieldErrors) setFieldErrors(res.fieldErrors);
        const friendly =
          res?.message?.trim() ||
          statusToMessage(res?.status) ||
         null;
        setError(friendly);
        toast.error(friendly, { duration: 3500 });
      }
    } catch (err) {
      const apiStatus = err?.status || err?.response?.status;
      const apiMsg =
        err?.message ||
        err?.response?.data?.message ||
        statusToMessage(apiStatus);
      const friendly = apiMsg || "Network error. Please check your connection.";
      setError(friendly);
      toast.error(friendly, { duration: 3500 });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render a small red helper text
  const FieldError = ({ msg }) =>
    msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null;

  return (
    <div
      className="bg-[#f6e6d8] flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 80px)", marginTop: "80px" }}
    >
      <div className="w-full max-w-md relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-500 text-sm">Join us in a few seconds</p>
          </div>

          {error && (
            <div
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
               Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={`block w-full h-12 rounded-xl border-2 px-4 text-gray-800 bg-white/50
                  placeholder:text-gray-400 transition-all duration-200
                  focus:outline-none focus:bg-white hover:border-gray-300
                  ${fieldErrors?.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              />
              <FieldError msg={fieldErrors?.name} />
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`block w-full h-12 rounded-xl border-2 px-4 text-gray-800 bg-white/50
                  placeholder:text-gray-400 transition-all duration-200
                  focus:outline-none focus:bg-white hover:border-gray-300
                  ${fieldErrors?.email ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              />
              <FieldError msg={fieldErrors?.email} />
            </div>

          {/* Mobile Number */}
          <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
               Mobile Number
              </label>
              <input
                type="number"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your Mobile Number"
                className={`block w-full h-12 rounded-xl border-2 px-4 text-gray-800 bg-white/50
                  placeholder:text-gray-400 transition-all duration-200
                  focus:outline-none focus:bg-white hover:border-gray-300
                  ${fieldErrors?.phone ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
              />
              <FieldError msg={fieldErrors?.phone} />
            </div>
          

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`block w-full h-12 rounded-xl border-2 px-4 pr-12 text-gray-800 bg-white/50
                    placeholder:text-gray-400 transition-all duration-200
                    focus:outline-none focus:bg-white hover:border-gray-300
                    ${fieldErrors?.password ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use at least 6 characters. A mix of letters and numbers is recommended.
              </p>
              <FieldError msg={fieldErrors?.password} />
            </div>

            {/* Confirm Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showCP ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`block w-full h-12 rounded-xl border-2 px-4 pr-12 text-gray-800 bg-white/50
                    placeholder:text-gray-400 transition-all duration-200
                    focus:outline-none focus:bg-white hover:border-gray-300
                    ${fieldErrors?.confirm ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCP((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showCP ? "Hide" : "Show"}
                </button>
              </div>
              <FieldError msg={fieldErrors?.confirm} />
            </div>

            {/* Terms */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-gray-800 transition-all duration-300
                         bg-[#faeade] hover:bg-[#f5dcd0] hover:shadow-lg hover:shadow-orange-200/50
                         focus:outline-none focus:ring-4 focus:ring-orange-300/40
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
