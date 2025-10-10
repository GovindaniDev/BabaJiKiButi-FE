// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { isAuthenticated, loading, login, user,setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setFieldErrors({});
  setIsLoading(true);

  try {
    // 🔐 Hard-coded admin check
   // src/pages/LoginPage.jsx  (inside handleSubmit)





    // Otherwise, run your normal login flow
    const res = await login(email.trim(), password, rememberMe);

if (email.trim() === "admin@gmail.com" && password === "admin123") {
    toast.success("Welcome, Admin!", { duration: 4000 });
    //setUser({ email: "admin@gmail.com", role: "admin", name: "Admin" });
    navigate("/admin", { replace: true });
    setIsLoading(false);
    return;
  }



    if (res?.ok) {
      const name = res.user?.name || res.user?.fullName || res.user?.email || "User";
      toast.success(`Welcome, ${name}!`, { duration: 4000 });
      navigate(from, { replace: true });
    } else {
      if (res?.fieldErrors) setFieldErrors(res.fieldErrors);
      const msg = res?.message || "Login failed";
      setError(msg);
      toast.error(msg, { duration: 3000 });
    }
  } catch {
    const msg = "Unable to login. Please try again.";
    setError(msg);
    toast.error(msg, { duration: 4000 });
  } finally {
    setIsLoading(false);
  }
};


  if (!loading && isAuthenticated) {
    const name = user?.name || user?.fullName || user?.email || "there";
    return (
      <div
        className="bg-[#f6e6d8] flex items-center justify-center px-6 py-12"
        style={{ minHeight: "calc(100vh - 80px)", marginTop: "80px" }}
      >
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
            <h2 className="text-2xl font-bold mb-2">You’re already signed in</h2>
            <p className="text-gray-600 mb-6">Hi {name}! You don’t need to log in again.</p>
            <div className="flex gap-3">
              <Link to="/" className="px-4 py-2 rounded-xl bg-[#faeade] hover:bg-[#f5dcd0] font-semibold transition">
                Go home
              </Link>
              <Link to="/account" className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-white font-semibold transition">
                Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = email.trim() && password && !isLoading;
  const FieldError = ({ msg }) => (msg ? <p className="mt-1 text-xs text-red-600">{msg}</p> : null);

  return (
    <div
      className="bg-[#f6e6d8] flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 80px)", marginTop: "80px" }}
    >
      <div className="w-full max-w-md relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
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
            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full h-12 rounded-xl border-2 px-4 text-gray-800 bg-white/50 backdrop-blur-sm
                    placeholder:text-gray-400 transition-all duration-200
                    focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-blue-500/20
                    hover:border-gray-300 hover:shadow-md
                    ${fieldErrors?.email ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                  placeholder="Enter your email"
                />
              </div>
              <FieldError msg={fieldErrors?.email} />
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full h-12 rounded-xl border-2 px-4 pr-12 text-gray-800 bg-white/50 backdrop-blur-sm
                    placeholder:text-gray-400 transition-all duration-200
                    focus:outline-none focus:bg-white focus:shadow-lg focus:shadow-blue-500/20
                    hover:border-gray-300 hover:shadow-md
                    ${fieldErrors?.password ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <FieldError msg={fieldErrors?.password} />
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
              </label>

              <Link to="/forgot-password" className="text-sm font-semibold text-red hover:text-blue-700 transition-colors hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 rounded-xl font-semibold text-gray-800 transition-all duration-300 transform
                       bg-[#faeade] hover:bg-[#f5dcd0]
                       hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-200/50
                       focus:outline-none focus:ring-4 focus:ring-orange-300/40
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/80 text-gray-500 text-sm font-medium">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Socials */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => console.log("Login with Google")}
              className="flex items-center justify-center space-x-2 h-12 rounded-xl border-2 border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Google</span>
            </button>
            <button
              onClick={() => console.log("Login with GitHub")}
              className="flex items-center justify-center space-x-2 h-12 rounded-xl border-2 border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
            >
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">GitHub</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-red hover:text-blue-700 transition-colors hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}