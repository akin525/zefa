import { JSX, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
    X,
    LayoutDashboard,
    ClipboardCheck,
    History,
    UserCircle,
    LogOut,
    Shield,
    ChevronRight, BookmarkIcon
} from "lucide-react";
import zefaLogo from "@/assets/zefa.png"; // Ensure this path is correct

export default function Sidebar({
                                    isOpen,
                                    onClose,
                                }: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(isOpen);
    const location = useLocation();

    useEffect(() => {
        setSidebarOpen(isOpen);
    }, [isOpen]);

    // Check if the current route matches the link
    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:shadow-none border-r border-gray-100`}
            >
                {/* Scrollable Container */}
                <div className="flex flex-col h-full overflow-y-auto scroll-smooth">
                    {/* Header with Logo */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={zefaLogo} alt="ZEFA Logo" className="h-10" />
                            <div>
                                <div className="text-sm font-bold text-[#004d25]">ZEFA</div>
                                <div className="text-xs text-gray-500">Verification System</div>
                            </div>
                        </Link>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#e6f2ec] flex items-center justify-center text-[#004d25] font-bold">
                                {/* Display user initials - replace with actual logic */}
                                AD
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-800">Admin User</div>
                                <div className="text-xs text-gray-500">Verification Officer</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6">
                        <div className="space-y-1">
                            <SidebarLink
                                to="/dashboard"
                                icon={<LayoutDashboard size={18} />}
                                isActive={isActive("/dashboard")}
                            >
                                Dashboard
                            </SidebarLink>

                            <SidebarLink
                                to="/verification"
                                icon={<ClipboardCheck size={18} />}
                                isActive={isActive("/verification")}
                            >
                                Verification
                            </SidebarLink>
                            <SidebarLink
                                to="/verify-business"
                                icon={<BookmarkIcon size={18} />}
                                isActive={isActive("/verification")}
                            >
                                Verify Business
                            </SidebarLink>
                            <SidebarLink
                                to="/business-shareholder"
                                icon={<ClipboardCheck size={18} />}
                                isActive={isActive("/verification")}
                            >
                                Business ShareHolder
                            </SidebarLink>

                            <SidebarLink
                                to="/verification-history"
                                icon={<History size={18} />}
                                isActive={isActive("/verification-history")}
                            >
                                Verification History
                            </SidebarLink>

                            <div className="pt-6 mt-6 border-t border-gray-100">
                                <SidebarLink
                                    to="/profile"
                                    icon={<UserCircle size={18} />}
                                    isActive={isActive("/profile")}
                                >
                                    Profile
                                </SidebarLink>
                            </div>
                        </div>
                    </nav>

                    {/* System Status */}
                    <div className="px-4 py-3">
                        <div className="bg-[#e6f2ec] rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-[#004d25]" />
                                <span className="text-xs font-medium text-[#004d25]">System Status</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-600">Verification system online</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 mt-auto">
                        <Link
                            to="/login"
                            className="flex items-center justify-between px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={18} className="text-gray-500" />
                                <span className="font-medium">Sign Out</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}

function SidebarLink({
                         to,
                         icon,
                         children,
                         isActive,
                     }: {
    to: string;
    icon: JSX.Element;
    children: React.ReactNode;
    isActive: boolean;
}) {
    return (
        <Link
            to={to}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                    ? "bg-[#e6f2ec] text-[#004d25] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`${isActive ? "text-[#004d25]" : "text-gray-500"}`}>
                    {icon}
                </div>
                <span>{children}</span>
            </div>
            {isActive && <ChevronRight size={16} className="text-[#004d25]" />}
        </Link>
    );
}
