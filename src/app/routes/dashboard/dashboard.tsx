import {useState, useEffect, JSX} from 'react';
import { Link } from 'react-router';
import {
    Users, FileText, CheckCircle, Clock, AlertTriangle,
    TrendingUp, UserCheck, ChevronRight, Eye, RefreshCw,
    BarChart3, Shield, Activity, Calendar, Bell,
    ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import { dashboardAPI } from '@/services/api';
import pic1 from "@/assets/zefav.png";

// Type definitions
interface User {
    first_name: string;
    last_name: string;
    email: string;
    id: string;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    weeklyTrend: number;
    totalToday: number;
    thisWeek: number;
}

interface VerificationData {
    firstName?: string;
    firstname?: string;
    lastName?: string;
    lastname?: string;
    [key: string]: any;
}

interface RecentVerification {
    id: string;
    verification_type: string;
    created_at: string;
    response_data: {
        success: boolean;
        data: VerificationData;
    };
}

interface PriorityItem {
    id: string;
    type: string;
    priority: 'high' | 'medium' | 'low';
    created_at: string;
}

interface DashboardData {
    user: User;
    stats: Stats;
    recentVerifications: RecentVerification[];
    priorityItems: PriorityItem[];
}

interface ApiResponse {
    data: {
        status: boolean;
        message?: string;
        data: DashboardData;
    };
}

// Component Props Interfaces
interface StatusBadgeProps {
    status: boolean | number | string;
}

interface MetricCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: 'amber' | 'green' | 'emerald' | 'red' | 'blue';
    trend?: string;
    trendUp?: boolean;
    bgGradient: string;
    urgent?: boolean;
    showProgress?: boolean;
    progressValue?: number;
}

interface QuickActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
    color: 'emerald' | 'blue' | 'purple' | 'amber';
    count?: number;
    priority?: boolean;
}

interface ColorClasses {
    bg: string;
    text: string;
    hover?: string;
    border: string;
    iconBg: string;
    gradient?: string;
}

export default function Dashboard(): JSX.Element | null{
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

    // Fetch dashboard data
    const fetchDashboardData = async (): Promise<void> => {
        try {
            setLoading(true);
            const response: ApiResponse = await dashboardAPI.getDashboard();

            if (response.data.status) {
                setDashboardData(response.data.data);
                setError(null);
            } else {
                setError(response.data.message || 'Failed to load dashboard data');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Refresh dashboard data
    const handleRefresh = async (): Promise<void> => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchDashboardData();

        // Set up auto-refresh every 5 minutes
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardHeader setSidebarOpen={setSidebarOpen} />

                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center">
                                    <div className="relative">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                                        </div>
                                        <div className="absolute inset-0 w-16 h-16 mx-auto bg-emerald-200 rounded-full animate-ping opacity-20"></div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
                                    <p className="text-gray-600">Please wait while we fetch your data...</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <DashboardHeader setSidebarOpen={setSidebarOpen} />

                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
                                    <p className="text-gray-600 mb-6">{error}</p>
                                    <button
                                        onClick={fetchDashboardData}
                                        className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { user, stats, recentVerifications, priorityItems } = dashboardData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Welcome Header */}
                        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-700 rounded-3xl p-6 lg:p-8 text-white shadow-2xl">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 animate-pulse delay-1000"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        {/* ZEFA Logo */}
                                        <div className="hidden sm:block">
                                            <img src={pic1} alt="ZEFA MFB" className="h-16 w-auto drop-shadow-lg" />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-2xl lg:text-3xl font-bold">
                                                    Welcome back, {user.first_name}!
                                                </h1>
                                                <div className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full">
                                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                    <span className="text-xs font-medium">Online</span>
                                                </div>
                                            </div>
                                            <p className="text-emerald-100 text-base lg:text-lg flex items-center gap-2">
                                                <Bell className="w-5 h-5" />
                                                You have <span className="font-semibold text-white">{stats.pending}</span> pending verifications to review
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleRefresh}
                                            disabled={refreshing}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 disabled:opacity-50 backdrop-blur-sm border border-white/20"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                            <span className="hidden sm:inline">Refresh</span>
                                        </button>

                                        <div className="text-right">
                                            <p className="text-emerald-100 text-sm">
                                                Last updated: {new Date().toLocaleTimeString()}
                                            </p>
                                            <p className="text-emerald-200 text-xs">
                                                {new Date().toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Priority Alert */}
                        {priorityItems.length > 0 && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-amber-800">Priority Items</h3>
                                            <span className="px-2 py-1 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">
                                                {priorityItems.length}
                                            </span>
                                        </div>
                                        <p className="text-amber-700 mb-4">
                                            These verifications require immediate attention due to high value, age, or priority status.
                                        </p>
                                        <Link
                                            to="/verifications?filter=priority"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Review Priority Items
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Total Verifications"
                                value={stats.total.toLocaleString()}
                                icon={<FileText className="w-6 h-6" />}
                                color="blue"
                                trend={`${stats.weeklyTrend >= 0 ? '+' : ''}${stats.weeklyTrend} this week`}
                                trendUp={stats.weeklyTrend >= 0}
                                bgGradient="from-blue-500 to-blue-600"
                            />
                            <MetricCard
                                title="Pending Reviews"
                                value={stats.pending.toLocaleString()}
                                icon={<Clock className="w-6 h-6" />}
                                color="amber"
                                bgGradient="from-amber-500 to-orange-500"
                                urgent={stats.pending > 10}
                            />
                            <MetricCard
                                title="Approved Today"
                                value={stats.approved.toLocaleString()}
                                icon={<CheckCircle className="w-6 h-6" />}
                                color="green"
                                bgGradient="from-emerald-500 to-green-600"
                            />
                            <MetricCard
                                title="Approval Rate"
                                value={`${stats.approvalRate}%`}
                                icon={<TrendingUp className="w-6 h-6" />}
                                color="emerald"
                                bgGradient="from-emerald-600 to-teal-600"
                                showProgress={true}
                                progressValue={stats.approvalRate}
                            />
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Left Column - Quick Actions & Recent Activity */}
                            <div className="xl:col-span-2 space-y-6">
                                {/* Enhanced Quick Actions */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <QuickActionCard
                                            title="New Verifications"
                                            description="Review and process new verification requests"
                                            icon={<FileText className="w-6 h-6" />}
                                            link="/verification?status=pending"
                                            color="emerald"
                                            count={stats.pending}
                                            priority={stats.pending > 5}
                                        />
                                        <QuickActionCard
                                            title="Customer Search"
                                            description="Search and view customer verification history"
                                            icon={<Users className="w-6 h-6" />}
                                            link="/customers"
                                            color="blue"
                                        />
                                        <QuickActionCard
                                            title="Analytics & Reports"
                                            description="Generate verification reports and analytics"
                                            icon={<BarChart3 className="w-6 h-6" />}
                                            link="/reports"
                                            color="purple"
                                        />
                                        <QuickActionCard
                                            title="Account Settings"
                                            description="Manage your account and verification preferences"
                                            icon={<UserCheck className="w-6 h-6" />}
                                            link="/settings"
                                            color="amber"
                                        />
                                    </div>
                                </div>

                                {/* Enhanced Recent Verifications */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                                        </div>
                                        <Link
                                            to="/verification-history"
                                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                                        >
                                            View All
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    {recentVerifications.length > 0 ? (
                                        <div className="space-y-4">
                                            {recentVerifications.slice(0, 5).map((verification) => (
                                                <div key={verification.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <UserCheck className="w-6 h-6 text-emerald-600" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {verification?.response_data?.data?.firstName ||
                                                                    verification?.response_data?.data?.firstname || 'N/A'}
                                                            </p>
                                                            <StatusBadge status={verification?.response_data?.success} />
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {verification.verification_type || 'KYC'} • {new Date(verification.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                                            <p className="text-gray-500">Recent verifications will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Enhanced Performance Stats */}
                            <div className="space-y-6">
                                {/* Today's Performance */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                            <Target className="w-5 h-5 text-green-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Today's Performance</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <span className="text-gray-700 font-medium">Processed Today</span>
                                            </div>
                                            <span className="font-bold text-emerald-600 text-lg">{stats.totalToday}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-gray-700 font-medium">This Week</span>
                                            </div>
                                            <span className="font-bold text-blue-600 text-lg">{stats.thisWeek}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                </div>
                                                <span className="text-gray-700 font-medium">Approval Rate</span>
                                            </div>
                                            <span className="font-bold text-green-600 text-lg">{stats.approvalRate}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Quick Stats */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Quick Stats</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                            <div className="flex items-center justify-center gap-1 mb-2">
                                                <ArrowUpRight className="w-4 h-4 text-green-600" />
                                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                                            </div>
                                            <p className="text-sm font-medium text-green-700">Approved</p>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                                            <div className="flex items-center justify-center gap-1 mb-2">
                                                <ArrowDownRight className="w-4 h-4 text-red-600" />
                                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                                            </div>
                                            <p className="text-sm font-medium text-red-700">Rejected</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Weekly Progress */}
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <Target className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Weekly Progress</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 font-medium">This Week</span>
                                            <span className="font-bold text-gray-900">{stats.thisWeek}</span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                                                    style={{ width: `${Math.min((stats.thisWeek / 50) * 100, 100)}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>0</span>
                                                <span className="font-medium">Target: 50</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Progress</span>
                                                <span className={`font-bold ${stats.thisWeek >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {Math.round((stats.thisWeek / 50) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Status */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <h3 className="font-bold text-emerald-800">Security Status</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-emerald-700">System Secure</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-emerald-700">All Verifications Encrypted</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-emerald-700">ZEFA MFB Compliant</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// Helper Components

// Status Badge Component
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusConfig = (status: boolean | number | string) => {
        if (typeof status === 'boolean') {
            return status
                ? { label: 'Success', color: 'bg-green-100 text-green-800', icon: CheckCircle }
                : { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
        }

        if (typeof status === 'string') {
            switch (status.toLowerCase()) {
                case 'approved':
                case 'success':
                    return { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle };
                case 'pending':
                    return { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock };
                case 'rejected':
                case 'failed':
                    return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
                default:
                    return { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
            }
        }

        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: Clock };
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            <IconComponent className="w-3 h-3" />
            {config.label}
        </span>
    );
};

// Enhanced Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({
                                                   title,
                                                   value,
                                                   icon,
                                                   color,
                                                   trend,
                                                   trendUp,
                                                   urgent = false,
                                                   showProgress = false,
                                                   progressValue = 0
                                               }) => {
    const getColorClasses = (color: string): ColorClasses => {
        const colorMap: Record<string, ColorClasses> = {
            amber: {
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                hover: 'hover:bg-amber-100',
                border: 'border-amber-200',
                iconBg: 'bg-amber-100',
                gradient: 'from-amber-500 to-orange-500'
            },
            green: {
                bg: 'bg-green-50',
                text: 'text-green-600',
                hover: 'hover:bg-green-100',
                border: 'border-green-200',
                iconBg: 'bg-green-100',
                gradient: 'from-emerald-500 to-green-600'
            },
            emerald: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                hover: 'hover:bg-emerald-100',
                border: 'border-emerald-200',
                iconBg: 'bg-emerald-100',
                gradient: 'from-emerald-600 to-teal-600'
            },
            red: {
                bg: 'bg-red-50',
                text: 'text-red-600',
                hover: 'hover:bg-red-100',
                border: 'border-red-200',
                iconBg: 'bg-red-100',
                gradient: 'from-red-500 to-red-600'
            },
            blue: {
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                hover: 'hover:bg-blue-100',
                border: 'border-blue-200',
                iconBg: 'bg-blue-100',
                gradient: 'from-blue-500 to-blue-600'
            }
        };
        return colorMap[color] || colorMap.blue;
    };

    const colorClasses = getColorClasses(color);

    return (
        <div className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border ${colorClasses.border} ${colorClasses.hover} transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group`}>
            {urgent && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500">
                    <div className="absolute -top-4 -right-1 text-white text-xs font-bold transform rotate-45">
                        !
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${colorClasses.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <div className={colorClasses.text}>
                            {icon}
                        </div>
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {trendUp ? (
                                <ArrowUpRight className="w-3 h-3" />
                            ) : (
                                <ArrowDownRight className="w-3 h-3" />
                            )}
                            {trend}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>

                    {showProgress && (
                        <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`bg-gradient-to-r ${colorClasses.gradient} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min(progressValue, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
        </div>
    );
};

// Enhanced Quick Action Card Component
const QuickActionCard: React.FC<QuickActionCardProps> = ({
                                                             title,
                                                             description,
                                                             icon,
                                                             link,
                                                             color,
                                                             count,
                                                             priority = false
                                                         }) => {
    const getColorClasses = (color: string): ColorClasses => {
        const colorMap: Record<string, ColorClasses> = {
            emerald: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-600',
                hover: 'hover:bg-emerald-100',
                border: 'border-emerald-200',
                iconBg: 'bg-emerald-100',
                gradient: 'from-emerald-500 to-emerald-600'
            },
            blue: {
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                hover: 'hover:bg-blue-100',
                border: 'border-blue-200',
                iconBg: 'bg-blue-100',
                gradient: 'from-blue-500 to-blue-600'
            },
            purple: {
                bg: 'bg-purple-50',
                text: 'text-purple-600',
                hover: 'hover:bg-purple-100',
                border: 'border-purple-200',
                iconBg: 'bg-purple-100',
                gradient: 'from-purple-500 to-purple-600'
            },
            amber: {
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                hover: 'hover:bg-amber-100',
                border: 'border-amber-200',
                iconBg: 'bg-amber-100',
                gradient: 'from-amber-500 to-amber-600'
            }
        };
        return colorMap[color] || colorMap.blue;
    };

    const colorClasses = getColorClasses(color);

    return (
        <Link
            to={link}
            className={`relative block p-6 bg-white rounded-2xl border ${colorClasses.border} ${colorClasses.hover} transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group`}
        >
            {priority && (
                <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
            )}

            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${colorClasses.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                    <div className={colorClasses.text}>
                        {icon}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {title}
                        </h3>
                        {count !== undefined && (
                            <span className={`px-2 py-1 ${colorClasses.bg} ${colorClasses.text} text-xs font-bold rounded-full`}>
                                {count}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{description}</p>

                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                        <span>Get started</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                </div>
            </div>

            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-2xl`} />
        </Link>
    );
};

// Utility function to format time ago
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
};

// Export utility functions for use in other components
export { StatusBadge, MetricCard, QuickActionCard, formatTimeAgo };

