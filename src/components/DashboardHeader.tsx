import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  Menu,
  ChevronDown,
  Search,
  Bell,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Settings,
  LogOut,
  RefreshCw
} from "lucide-react";
import { useUser } from "@/context/UserContext.tsx";
import zefaLogo from "@/assets/zefa.png"; // Ensure this path is correct

export default function VerificationHeader({
                                             setSidebarOpen,
                                           }: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock notifications - replace with actual data
  const [notifications] = useState([
    {
      id: 1,
      type: "urgent",
      title: "High Priority Verification",
      message: "KYC verification VRF-2023-0042 requires immediate attention",
      time: "2 min ago",
      unread: true
    },
    {
      id: 2,
      type: "success",
      title: "Verification Completed",
      message: "Address verification for Sarah Okafor has been approved",
      time: "15 min ago",
      unread: true
    },
    {
      id: 3,
      type: "warning",
      title: "Document Flagged",
      message: "Suspicious document detected in VRF-2023-0039",
      time: "1 hour ago",
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/verification?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/verification") return "Verification";
    if (path === "/verification-history") return "Verification History";
    if (path === "/profile") return "Profile";
    return "ZEFA Verification System";
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Mobile Menu + Logo + Page Title */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Logo (visible on mobile when sidebar is closed) */}
              <div className="lg:hidden flex items-center">
                <img src={zefaLogo} alt="ZEFA Logo" className="h-8" />
              </div>

              {/* Page Title (hidden on mobile) */}
              <div className="hidden lg:block">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#e6f2ec] rounded-lg">
                    <Shield className="w-5 h-5 text-[#004d25]" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleDateString('en-NG', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="search"
                    placeholder="Search verification ID, customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:border-[#2e8b57] transition-colors"
                />
              </form>
            </div>

            {/* Right Section - Actions + Profile */}
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh data"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                              <span className="text-xs text-[#2e8b57] font-medium">
                          {unreadCount} new
                        </span>
                          )}
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                    notification.unread ? 'bg-blue-50/30' : ''
                                }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    {notification.unread && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>

                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <Link
                            to="/notifications"
                            className="text-xs text-[#2e8b57] hover:text-[#004d25] font-medium block text-center"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                )}
              </div>

              {/* System Status Indicator */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">System Online</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-[#004d25] text-white flex items-center justify-center text-sm font-semibold">
                    {user?.first_name?.[0]}{user?.last_name?.[0] || 'A'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 z-50 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-[#004d25] text-white flex items-center justify-center font-semibold">
                            {user?.first_name?.[0]}{user?.last_name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user?.first_name} {user?.last_name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                            <p className="text-xs text-[#2e8b57]">ID: {user?.id || 'ZEF001'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>Your Profile</span>
                        </Link>
                        <Link
                            to="/settings"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Page Title */}
        <div className="lg:hidden px-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-NG', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>

        {/* Click outside handlers */}
        {(userMenuOpen || notificationOpen) && (
            <div
                className="fixed inset-0 z-30"
                onClick={() => {
                  setUserMenuOpen(false);
                  setNotificationOpen(false);
                }}
            />
        )}
      </header>
  );
}
