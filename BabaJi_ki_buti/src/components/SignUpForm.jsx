import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [agree, setAgree]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSocial = (provider) => console.log(`Sign up with ${provider}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    if (!agree) {
      alert("Please accept Terms & Privacy.");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500)); // simulate API
    setIsLoading(false);
    console.log("Signup submitted:", { fullName, email, phone, password, agree });
  };

  return (
    <div
      className="bg-[#f6e6d8] flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 80px)", marginTop: "80px" }}
    >
      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-500 text-sm">Join us in a few seconds</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="block w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-gray-800 bg-white/50
                           placeholder:text-gray-400 transition-all duration-200
                           focus:outline-none focus:border-blue-500 focus:bg-white hover:border-gray-300"
              />
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
                className="block w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-gray-800 bg-white/50
                           placeholder:text-gray-400 transition-all duration-200
                           focus:outline-none focus:border-blue-500 focus:bg-white hover:border-gray-300"
              />
            </div>

            {/* Phone (optional)
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98730 33339"
                className="block w-full h-12 rounded-xl border-2 border-gray-200 px-4 text-gray-800 bg-white/50
                           placeholder:text-gray-400 transition-all duration-200
                           focus:outline-none focus:border-blue-500 focus:bg-white hover:border-gray-300"
              />
            </div> */}

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
                  className="block w-full h-12 rounded-xl border-2 border-gray-200 px-4 pr-12 text-gray-800 bg-white/50
                             placeholder:text-gray-400 transition-all duration-200
                             focus:outline-none focus:border-blue-500 focus:bg-white hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {/* <div className="group">
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
                  className="block w-full h-12 rounded-xl border-2 border-gray-200 px-4 pr-12 text-gray-800 bg-white/50
                             placeholder:text-gray-400 transition-all duration-200
                             focus:outline-none focus:border-blue-500 focus:bg-white hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowCP((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showCP ? "Hide" : "Show"}
                </button>
              </div>
            </div> */}

            {/* Terms */}
            {/* <label className="flex items-center gap-3 cursor-pointer">
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
            </label> */}

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
                  <div className="w-5 h-5 border-2 border-gray-600/30 border-top-gray-600 rounded-full animate-spin" />
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/80 text-gray-500 text-sm font-medium">
                  Or sign up with
                </span>
              </div>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocial("Google")}
              className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-gray-200 bg-white/60
                         hover:bg-white hover:border-gray-300 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>

            <button
              onClick={() => handleSocial("GitHub")}
              className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-gray-200 bg-white/60
                         hover:bg-white hover:border-gray-300 transition"
            >
              <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.24c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.04.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.93.43.37.83 1.08.83 2.22v3.29c0 .32.19.69.8.58C20.56 21.8 24 17.3 24 12 24 5.37 18.63 0 12 0z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">GitHub</span>
            </button>
          </div>

          {/* Switch to login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-red hover:text-blue-700 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
