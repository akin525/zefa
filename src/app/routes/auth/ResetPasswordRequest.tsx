import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import pic1 from "@/assets/zefa.png";
import pic from "@/assets/zefav.png";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function ResetPasswordRequest() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (email: string) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${baseUrl}reset_password_code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success === true) {
                setSuccess(true);
                toast.success(data.message || "Reset code sent successfully!");
                setTimeout(() => {
                    window.location.href = "/set-password";
                }, 2000);
            } else {
                setError(data.message || "Failed to send reset code");
                toast.error(data.message || "Failed to send reset code");
            }
        } catch (err: any) {
            const errorMessage = "Network error. Please check your connection and try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError("");
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                        {/* Success Icon */}
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>

                        {/* ZEFA Logo */}
                        <div className="flex justify-center mb-6">
                            <img src={pic1} alt="ZEFA MFB" className="h-12" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Check Your Email
                        </h2>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            We've sent a password reset code to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <p className="text-sm text-emerald-800">
                                    <strong>Next steps:</strong> Enter the code you received to create a new password.
                                </p>
                            </div>

                            <Link
                                to="/set-password"
                                className="inline-flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Continue to Reset Password
                            </Link>

                            <p className="text-xs text-gray-500">
                                Didn't receive the email? Check your spam folder or{" "}
                                <button
                                    onClick={() => {
                                        setSuccess(false);
                                        setEmail("");
                                    }}
                                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
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
                                    Secure Account
                                    <span className="block text-emerald-200">Recovery</span>
                                </h1>
                                <p className="text-xl text-emerald-100 leading-relaxed max-w-md">
                                    We'll help you regain access to your ZEFA account safely and securely.
                                </p>
                            </div>

                            {/* Security Features */}
                            <div className="space-y-4 max-w-md">
                                <div className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                                    <div className="flex-shrink-0">
                                        <Shield className="w-8 h-8 text-emerald-200" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-black">Secure Process</h3>
                                        <p className="text-sm text-emerald-500">Bank-grade security protocols</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20">
                                    <div className="flex-shrink-0">
                                        <Mail className="w-8 h-8 text-emerald-200" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-black">Email Verification</h3>
                                        <p className="text-sm text-emerald-500">Sent to your registered email</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
                    <div className="w-full max-w-md mx-auto">
                        {/* Back Button */}
                        <div className="mb-8">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-gray-600 hover:text-emerald-700 transition-all duration-200 group"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Back to Sign In</span>
                            </Link>
                        </div>

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <img src={pic1} alt="ZEFA MFB" className="h-16" />
                        </div>

                        {/* Header */}
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                Forgot Your Password?
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                No worries! Enter your registered email address and we'll send you a secure reset code.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRequest} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className={`h-5 w-5 transition-colors ${
                                            error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-emerald-600'
                                        }`} />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="Enter your registered email"
                                        className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm transition-all duration-200 ${
                                            error
                                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 bg-white focus:border-emerald-500 focus:ring-emerald-500 hover:border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center mt-2 text-sm text-red-600 animate-in slide-in-from-left-1">
                                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}
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
                                        Sending Reset Code...
                                    </>
                                ) : (
                                    "Send Reset Code"
                                )}
                            </button>
                        </form>

                        {/* Help Text */}
                        <div className="mt-8 space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <h4 className="font-semibold text-emerald-800 mb-2">What happens next?</h4>
                                <ul className="text-sm text-emerald-700 space-y-1">
                                    <li>• We'll send a secure code to your email</li>
                                    <li>• Enter the code on the next page</li>
                                    <li>• Create your new password</li>
                                    <li>• Sign in with your new credentials</li>
                                </ul>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Remember your password?{" "}
                                    <Link
                                        to="/login"
                                        className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
                                    >
                                        Sign in instead
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                                <Shield className="h-4 w-4 mr-2 text-emerald-600" />
                                Your security is our top priority
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
