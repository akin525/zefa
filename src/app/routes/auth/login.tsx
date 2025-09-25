import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, AlertCircle, Shield, Users, Award } from "lucide-react";
import { toast } from "react-toastify";
import pic1 from "@/assets/zefa.png";
import pic from "@/assets/zefav.png";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Define types
interface LoginErrors {
  email?: string;
  password?: string;
}

interface LoginResponse {
  status: boolean;
  message: string;
  data?: {
    access_token: string;
  };
}

const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const browser = (() => {
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edg")) return "Edge";
    return "Unknown";
  })();
  return `${platform} ${browser}`;
};
const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout: number = 30000,
    retries: number = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // If it's the last retry, throw the error
      if (i === retries - 1) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timed out after ${timeout / 1000} seconds`);
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network connection failed. Please check your internet connection.');
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const device_name = getDeviceName();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email address is invalid";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check if baseUrl is defined
    if (!baseUrl) {
      toast.error("API configuration error. Please contact support.");
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login to:', `${baseUrl}login`);

      const response = await fetchWithTimeout(
          `${baseUrl}login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password,
              device_name
            }),
          },
          300000, // 30 seconds timeout
          2 // 2 retries
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is ok
      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('Network connection failed. Please check your internet connection.');
        }
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        if (response.status === 429) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        }
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid server response format.');
      }

      const data: LoginResponse = await response.json();
      console.log('Response data:', data);

      if (data.status && data.data?.access_token) {
        const token = data.data.access_token;

        // Store token based on remember me preference
        if (rememberMe) {
          localStorage.setItem("authToken", token);
          sessionStorage.removeItem("authToken"); // Clear session storage
        } else {
          sessionStorage.setItem("authToken", token);
          localStorage.removeItem("authToken"); // Clear local storage
        }

        toast.success(data.message || "Login successful!");

        // Use navigate instead of window.location.href for better SPA behavior
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);

      } else {
        // Handle API errors
        const errorMessage = data.message || "Login failed. Please check your credentials.";
        toast.error(errorMessage);

        // Clear password on failed login
        setPassword("");
      }

    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = "Login failed. Please try again.";

      if (error.message.includes('timeout')) {
        errorMessage = "Connection timeout. Please check your internet connection and try again.";
      } else if (error.message.includes('Network connection failed')) {
        errorMessage = "Network connection failed. Please check your internet connection.";
      } else if (error.message.includes('Server error')) {
        errorMessage = "Server is temporarily unavailable. Please try again later.";
      } else if (error.message.includes('Too many login attempts')) {
        errorMessage = "Too many login attempts. Please wait a moment and try again.";
      } else if (error.name === 'SyntaxError') {
        errorMessage = "Invalid server response. Please try again.";
      }

      toast.error(errorMessage);

      // Clear password on error
      setPassword("");

    } finally {
      setLoading(false);
    }
  };


  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Brand Panel */}
          <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              <div className="absolute top-1/3 right-0 w-96 h-96 bg-white opacity-3 rounded-full translate-x-1/3 animate-pulse delay-1000"></div>
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white opacity-4 rounded-full translate-y-1/2 animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
              {/* Logo */}
              <div className="mb-12">
                <img
                    src={pic}
                    alt="Zefa Microfinance Bank"
                    className="w-56 h-auto drop-shadow-2xl"
                />
              </div>

              {/* Main Content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-bold mb-4 leading-tight">
                    We Support Your Dream
                    <span className="block text-emerald-200">No matter Who You Are</span>
                  </h1>
                  <p className="text-xl text-emerald-100 leading-relaxed max-w-md">
                    Empowering communities through accessible financial services and innovative banking solutions.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 gap-4 max-w-md">
                  <div className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex-shrink-0">
                      <Shield className="w-8 h-8 text-emerald-200" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">Bank-Grade Security</h3>
                      <p className="text-sm text-emerald-500">256-bit encryption & multi-factor authentication</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex-shrink-0">
                      <Users className="w-8 h-8 text-emerald-200" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">24/7 Support</h3>
                      <p className="text-sm text-emerald-500">Round-the-clock customer assistance</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex-shrink-0">
                      <Award className="w-8 h-8 text-emerald-200" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black">Trusted Platform</h3>
                      <p className="text-sm text-emerald-500">Serving thousands of satisfied customers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
            <div className="w-full max-w-md mx-auto">
              {/* Back Button */}
              <div className="mb-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-600 hover:text-emerald-700 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to Home</span>
                </Link>
              </div>

              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <img src={pic1} alt="Zefa Logo" className="h-20" />
              </div>

              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Welcome Back
                </h2>
                <p className="text-gray-600">
                  Sign in to access your ZEFA account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-600'}`} />
                    </div>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            const newErrors = {...errors};
                            delete newErrors.email;
                            setErrors(newErrors);
                          }
                        }}
                        required
                        className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                            errors.email
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-200 bg-white focus:border-emerald-500 focus:ring-emerald-500 hover:border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                        placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                      <div className="flex items-center mt-2 text-sm text-red-600 animate-in slide-in-from-left-1">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.email}
                      </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <Link
                        to="/forgot-password"
                        className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-600'}`} />
                    </div>
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            const newErrors = {...errors};
                            delete newErrors.password;
                            setErrors(newErrors);
                          }
                        }}
                        required
                        className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                            errors.password
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                : 'border-gray-200 bg-white focus:border-emerald-500 focus:ring-emerald-500 hover:border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                        placeholder="Enter your password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                      <div className="flex items-center mt-2 text-sm text-red-600 animate-in slide-in-from-left-1">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        {errors.password}
                      </div>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-3 text-sm text-gray-700 font-medium">
                    Keep me signed in
                  </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center text-lg ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed transform-none"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                >
                  {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing you in...
                      </>
                  ) : (
                      "Sign In to Your Account"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">New to ZEFA?</span>
                  </div>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <Link
                    to="/register"
                    className="inline-flex items-center justify-center w-full py-3 px-6 border-2 border-emerald-200 rounded-xl text-emerald-700 font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 group"
                >
                  Create Your Account
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <Shield className="h-4 w-4 mr-2 text-emerald-600" />
                  Protected by 256-bit SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
