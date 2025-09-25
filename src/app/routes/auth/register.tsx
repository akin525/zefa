import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {Eye, EyeOff, ArrowLeft, User, Mail, Phone, Lock, Shield, CheckCircle, Users,  Award} from "lucide-react";
import { toast } from "react-toastify";
import pic from "@/assets/zefav.png";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

type RegisterFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

const formFields = [
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Enter your first name",
    icon: User
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Enter your last name",
    icon: User
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email address",
    icon: Mail
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter your phone number",
    icon: Phone
  },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormFields>>({});
  const [formData, setFormData] = useState<RegisterFormFields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const referral = searchParams.get("ref");
    if (referral) {
      setFormData(prev => ({ ...prev, referralCode: referral }));
    }
  }, []);


  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormFields> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email address is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeTerms) newErrors.agreeTerms = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormFields]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };

    try {
      const res = await fetch(`${baseUrl}basic-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        sessionStorage.setItem("authToken", data.data?.access_token);
        toast.success(data.message || "Account created successfully");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Brand Panel */}
          <div
              className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div
                  className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
              <div
                  className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-3 rounded-full -translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>
              <div
                  className="absolute top-1/2 left-1/4 w-64 h-64 bg-white opacity-4 rounded-full animate-pulse delay-500"></div>
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
                  <div
                      className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex-shrink-0">
                      <Shield className="w-8 h-8 text-emerald-200"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-black">Bank-Grade Security</h3>
                      <p className="text-sm text-emerald-500">256-bit encryption & multi-factor authentication</p>
                    </div>
                  </div>

                  <div
                      className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex-shrink-0">
                      <Users className="w-8 h-8 text-emerald-200"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-black">24/7 Support</h3>
                      <p className="text-sm text-emerald-500">Round-the-clock customer assistance</p>
                    </div>
                  </div>

                  <div
                      className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                    <div className="flex-shrink-0">
                      <Award className="w-8 h-8 text-emerald-200"/>
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

          {/* Right Registration Form */}
          <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-2xl mx-auto">
              {/* Back Button */}
              <div className="mb-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-600 hover:text-blue-700 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"/>
                  <span className="text-sm font-medium">Back to Home</span>
                </Link>
              </div>

              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Create Your Account
                </h2>
                <p className="text-gray-600">
                  Start your journey with SMARTP2P today
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.slice(0, 2).map(({id, label, type, placeholder, icon: Icon}) => (
                      <div key={id} className="space-y-2">
                        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
                          {label}
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Icon className={`h-5 w-5 transition-colors ${
                                errors[id as keyof RegisterFormFields]
                                    ? 'text-red-400'
                                    : 'text-gray-400 group-focus-within:text-blue-600'
                            }`}/>
                          </div>
                          <input
                              id={id}
                              name={id}
                              type={type}
                              value={formData[id as keyof RegisterFormFields] as string}
                              onChange={handleChange}
                              placeholder={placeholder}
                              className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                                  errors[id as keyof RegisterFormFields]
                                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                      : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                              required
                          />
                        </div>
                        {errors[id as keyof RegisterFormFields] && (
                            <p className="text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span>
                              {errors[id as keyof RegisterFormFields]}
                            </p>
                        )}
                      </div>
                  ))}
                </div>

                {/* Email and Phone Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields.slice(2, 4).map(({id, label, type, placeholder, icon: Icon}) => (
                      <div key={id} className="space-y-2">
                        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
                          {label}
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Icon className={`h-5 w-5 transition-colors ${
                                errors[id as keyof RegisterFormFields]
                                    ? 'text-red-400'
                                    : 'text-gray-400 group-focus-within:text-blue-600'
                            }`}/>
                          </div>
                          <input
                              id={id}
                              name={id}
                              type={type}
                              value={formData[id as keyof RegisterFormFields] as string}
                              onChange={handleChange}
                              placeholder={placeholder}
                              className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                                  errors[id as keyof RegisterFormFields]
                                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                      : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
                              } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                              required
                          />
                        </div>
                        {errors[id as keyof RegisterFormFields] && (
                            <p className="text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span>
                              {errors[id as keyof RegisterFormFields]}
                            </p>
                        )}
                      </div>
                  ))}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 transition-colors ${
                            errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-600'
                        }`}/>
                      </div>
                      <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
                          className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                              errors.password
                                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                  : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                          required
                      />
                      <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="space-y-2">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`h-2 flex-1 rounded-full transition-colors ${
                                        passwordStrength >= level
                                            ? passwordStrength <= 2
                                                ? 'bg-red-400'
                                                : passwordStrength <= 3
                                                    ? 'bg-yellow-400'
                                                    : 'bg-green-400'
                                            : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">
                            Password strength: {
                            passwordStrength <= 2 ? 'Weak' :
                                passwordStrength <= 3 ? 'Medium' : 'Strong'
                          }
                          </p>
                        </div>
                    )}

                    {errors.password && (
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span>
                          {errors.password}
                        </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 transition-colors ${
                            errors.confirmPassword ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-600'
                        }`}/>
                      </div>
                      <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                              errors.confirmPassword
                                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                  : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-500 hover:border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                          required
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                        <div className="flex items-center text-sm">
                          {formData.password === formData.confirmPassword ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1"/>
                                Passwords match
                              </div>
                          ) : (
                              <div className="flex items-center text-red-600">
                                <span className="mr-1">⚠</span>
                                Passwords don't match
                              </div>
                          )}
                        </div>
                    )}

                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="mr-1">⚠</span>
                          {errors.confirmPassword}
                        </p>
                    )}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                        id="agreeTerms"
                        name="agreeTerms"
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className={`h-5 w-5 mt-0.5 rounded border-2 transition-colors ${
                            errors.agreeTerms
                                ? 'border-red-300 text-red-600 focus:ring-red-500'
                                : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                        }`}
                        required
                    />
                    <label htmlFor="agreeTerms" className="text-sm text-gray-700 leading-relaxed">
                      I agree to the{" "}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.agreeTerms && (
                      <p className="text-sm text-red-600 flex items-center ml-8">
                        <span className="mr-1">⚠</span>
                        You must agree to the terms and conditions
                      </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading }
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center text-lg ${
                        loading 
                            ? "bg-gray-400 cursor-not-allowed transform-none"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                >
                  {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                             fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                  strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Your Account...
                      </>
                  ) : (
                      "Create Your Account"
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
                    <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
                  </div>
                </div>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full py-3 px-6 border-2 border-emerald-200 rounded-xl text-emerald-700 font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 group"
                >
                  Sign In to Your Account
                  <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <Shield className="h-4 w-4 mr-2 text-blue-600"/>
                  Your data is protected with enterprise-grade security
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
