// src/pages/SignUpForm.jsx (or wherever this lives)
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext"; // adjust path if needed
import { toast } from "react-toastify";

export default function SignUpForm() {
  const [name, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [showCP, setShowCP]       = useState(false);
  const [agree, setAgree]         = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  const { signup } = useAuth();     // <-- from AuthContext (we added earlier)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please accept Terms & Privacy");
      return;
    }

    setIsLoading(true);
    const res = await signup({
      name,    // if backend expects `name`, change to: name: name
      email,
      password,
    });
    setIsLoading(false);

    if (res.ok) {
       toast.success("Signed Up successfully!",{
          duration:4000
        });
      // ✅ redirect to login and prefill email via state
      navigate("/login", { replace: true, state: { emailPrefill: email } });
    } else {
      const msg = res?.message || "unable to create account";
            setError(msg);
            toast.error(msg,{
          duration:3000
        });
    }
  };

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
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
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

          {/* Divider + Socials … */}

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
