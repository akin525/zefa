import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FiMail, FiLock, FiKey } from "react-icons/fi";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function SetNewPassword() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${baseUrl}reset_password_code_submit`, {
                email,
                code,
                password,
                confirm_password: confirmPassword,
            });

            toast.success("✅ Password reset successful.");
        } catch (err) {
            toast.error("❌ Failed to reset password. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
            <Toaster position="top-center" />
            <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-10 animate-fadeIn">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    🔐 Set a New Password
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="code" className="block text-gray-700 font-medium mb-1">
                            Reset Code
                        </label>
                        <div className="relative">
                            <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                id="code"
                                type="text"
                                placeholder="Enter the reset code"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter new password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${
                            loading ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading && (
                            <svg
                                className="w-5 h-5 animate-spin text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                ></path>
                            </svg>
                        )}
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
