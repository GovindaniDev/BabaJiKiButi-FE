// LoginPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

export default function LoginForm() {
   const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ single call
  const { isAuthenticated, loading, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await login(email.trim(), password, rememberMe);
      if (res?.ok) {
        const name = res.user?.name || res.user?.fullName || res.user?.email || "User";
        toast.success(`Welcome, ${name}!`, { duration: 4000 });
        navigate(from, { replace: true });
      } else {
        const msg = res?.message || "Login failed";
        setError(msg);
        toast.error(msg, { duration: 3000 });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to login. Please try again.";
      setError(msg);
      toast.error(msg, { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

    // already-logged-in → home
   useEffect(() => {
    if (!loading && isAuthenticated) {
      const name = user?.name || user?.fullName || user?.email || "User";
      toast.success(`You are already logged in, ${name}.`, { duration: 4000 });
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, loading, navigate, user]);
  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  const canSubmit = email.trim() && password && !isLoading;

  return (
    <div className="bg-[#f6e6d8] flex items-center justify-center px-6 py-12 relative overflow-hidden"
         style={{ minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
      <div className="w-full max-w-md relative">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className="block w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-gray-800 bg-white/50 backdrop-blur-sm
                           placeholder:text-gray-400 transition-all duration-200
                           focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20
                           hover:border-gray-300 hover:shadow-md"
                  placeholder="Enter your email"
                />
              </div>
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
                  className="block w-full h-12 rounded-xl border-2 border-gray-200 px-4 pr-12 text-gray-800 bg-white/50 backdrop-blur-sm
                           placeholder:text-gray-400 transition-all duration-200
                           focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/20
                           hover:border-gray-300 hover:shadow-md"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                  rememberMe ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"
                }`} />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-red hover:text-blue-700 transition-colors hover:underline"
              >
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
                  <div className="w-5 h-5 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin"></div>
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
                <span className="px-4 bg-white/80 text-gray-500 text-sm font-medium">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* Socials */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center space-x-2 h-12 rounded-xl border-2 border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group">
              {/* ...icon... */}
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Google</span>
            </button>
            <button onClick={() => handleSocialLogin('GitHub')} className="flex items-center justify-center space-x-2 h-12 rounded-xl border-2 border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group">
              {/* ...icon... */}
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
