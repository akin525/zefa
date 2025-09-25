import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Download,
    Eye,
    User,
    Shield,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    FileText,
    Trash2,
    AlertCircle,
    Filter,
    TrendingUp,
    Activity,
    X,
    ChevronDown,
    Copy,
} from 'lucide-react';
import { verificationAPI } from "@/services/api";
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';

// Type definitions remain the same...
interface VerificationData {
    id: string;
    type: string;
    number: string;
    name: string;
    status: string;
    verification_success:boolean;
    timestamp: string;
    duration: string;
    cost: number;
    data: any;
    error?: string;
    reference?: string;
    provider?: string;
    webhook_status?: string;
}

interface ApiResponse {
    data: {
        status: boolean;
        message?: string;
        data: any[];
    };
}

type FilterType = 'all' | 'bvn' | 'nin' | 'phone';
type FilterStatus = 'all' | 'success' | 'failed' | 'pending';
type FilterDate = 'all' | 'today' | 'week' | 'month';

const VerificationHistory: React.FC = () => {
    // State management (same as before)
    const [verifications, setVerifications] = useState<VerificationData[]>([]);
    const [filteredVerifications, setFilteredVerifications] = useState<VerificationData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterDate, setFilterDate] = useState<FilterDate>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [selectedVerification, setSelectedVerification] = useState<VerificationData | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [verificationToDelete, setVerificationToDelete] = useState<VerificationData | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [copiedText, setCopiedText] = useState<string>('');

    // Transform API data (same as before)
    const transformApiData = (item: any): VerificationData => {
        const firstName = item.response_data?.data?.firstName || item.response_data?.data?.first_name || '';
        const middleName = item.middle_name || '';
        const lastName = item.last_name || '';
        const fullName = `${firstName} ${middleName} ${lastName}`.trim() || item.name || item.full_name || 'Unknown';

        return {
            id: item.id || item.verification_id || `VER${Date.now()}`,
            type: item.type || item.verification_type || 'unknown',
            number: item.number || item.verification_number || item.bvn || item.nin || 'N/A',
            name: fullName,
            status:item.status ||'pending',
            verification_success: item.verification_success || false,
            timestamp: item.timestamp || item.created_at || item.date || new Date().toISOString(),
            duration: item.duration || item.response_time || 'N/A',
            cost: Number(item.cost || item.price || item.amount || 0),
            data: item.data || item.response_data || item.verification_data || null,
            error: item.error || item.error_message || undefined,
            reference: item.reference || item.transaction_ref || undefined,
            provider: item.provider || undefined,
            webhook_status: item.webhook_status || undefined
        };
    };

    // All the existing functions remain the same (fetchHistory, useEffects, etc.)
    const fetchHistory = useCallback(async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response: ApiResponse = await verificationAPI.getHistory();

            if (response.data.status) {
                const transformedData = response.data.data.map(transformApiData);
                setVerifications(transformedData);
            } else {
                setError(response.data.message || 'Failed to fetch verification history');
            }
        } catch (err: any) {
            console.error('History fetch error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load verification history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(() => fetchHistory(true), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchHistory]);

    useEffect(() => {
        let filtered = [...verifications];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.number.toString().includes(searchTerm) ||
                item.id.toLowerCase().includes(searchLower) ||
                (item.reference && item.reference.toLowerCase().includes(searchLower))
            );
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(item => item.type === filterType);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(item => item.status === filterStatus);
        }

        if (filterDate !== 'all') {
            const now = new Date();
            let filterDateMs: number;

            switch (filterDate) {
                case 'today':
                    filterDateMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    break;
                case 'week':
                    filterDateMs = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
                    break;
                case 'month':
                    filterDateMs = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
                    break;
                default:
                    filterDateMs = 0;
            }

            if (filterDateMs > 0) {
                filtered = filtered.filter(item =>
                    new Date(item.timestamp).getTime() >= filterDateMs
                );
            }
        }

        setFilteredVerifications(filtered);
        setCurrentPage(1);
    }, [searchTerm, filterType, filterStatus, filterDate, verifications]);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredVerifications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);

    // Utility functions
    const getStatusIcon = (verification_success: boolean) => {
        switch (verification_success) {
            case true:
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case false:
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (verification_success: boolean): string => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        switch (verification_success) {
            case true:
                return `${baseClasses} bg-emerald-100 text-emerald-800`;
            case false:
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'bvn':
                return <CreditCard className="w-4 h-4 text-blue-500" />;
            case 'nin':
                return <Shield className="w-4 h-4 text-purple-500" />;
            case 'phone':
            case 'phone_number':
                return <User className="w-4 h-4 text-emerald-500" />;
            default:
                return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatDate = (timestamp: string): string => {
        try {
            return new Date(timestamp).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount: number): string => {
        return `₦${amount.toLocaleString()}`;
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(label);
            setTimeout(() => setCopiedText(''), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    // Event handlers
    const handleViewDetails = (verification: VerificationData) => {
        setSelectedVerification(verification);
        setShowDetailsModal(true);
    };

    const handleDelete = (verification: VerificationData) => {
        setVerificationToDelete(verification);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!verificationToDelete) return;

        try {
            setDeleteLoading(true);
            setVerifications(prev => prev.filter(v => v.id !== verificationToDelete.id));
            setShowDeleteModal(false);
            setVerificationToDelete(null);
        } catch (error) {
            console.error('Delete error:', error);
            setError('Failed to delete verification record');
        } finally {
            setDeleteLoading(false);
        }
    };

    const exportToCSV = () => {
        if (filteredVerifications.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['ID', 'Type', 'Number', 'Name', 'Status', 'Date', 'Duration', 'Cost', 'Reference'];
        const csvContent = [
            headers.join(','),
            ...filteredVerifications.map(item => [
                item.id,
                item.type.toUpperCase(),
                item.number,
                `"${item.name}"`,
                item.status,
                formatDate(item.timestamp),
                item.duration,
                item.cost,
                item.reference || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleRefresh = () => {
        fetchHistory(true);
    };

    // Statistics calculations
    const totalVerifications = verifications.length;
    const successfulVerifications = verifications.filter(v =>
        ['success', 'successful', 'completed'].includes(v.status?.toLowerCase())
    ).length;
    const failedVerifications = verifications.filter(v =>
        ['failed', 'error', 'unsuccessful'].includes(v.status?.toLowerCase())
    ).length;
    const totalCost = verifications.reduce((sum, v) => sum + v.cost, 0);
    const successRate = totalVerifications > 0 ? (successfulVerifications / totalVerifications) * 100 : 0;

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
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
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                    <Activity className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Loading verification history</h3>
                                    <p className="text-gray-600">Please wait while we fetch your data...</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // Error state
    if (error && verifications.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
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
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load history</h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
                                <button
                                    onClick={() => fetchHistory()}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-6 space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification History</h1>
                                <p className="text-gray-600">Monitor and manage all your verification activities</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                                >
                                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                                <button
                                    onClick={exportToCSV}
                                    disabled={filteredVerifications.length === 0}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800">Error</h4>
                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Total Verifications</p>
                                        <p className="text-3xl font-bold text-gray-900">{totalVerifications.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-1">All time</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Successful</p>
                                        <p className="text-3xl font-bold text-emerald-600">{successfulVerifications.toLocaleString()}</p>
                                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {successRate.toFixed(1)}% success rate
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Failed</p>
                                        <p className="text-3xl font-bold text-red-600">{failedVerifications.toLocaleString()}</p>
                                        <p className="text-xs text-red-600 mt-1">
                                            {totalVerifications > 0 ? ((failedVerifications / totalVerifications) * 100).toFixed(1) : 0}% failure rate
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
                                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Avg: {formatCurrency(totalVerifications > 0 ? totalCost / totalVerifications : 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Search and Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Search Bar */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Search by number, ID, reference, or name..."
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Filter Toggle */}
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`inline-flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors font-medium ${
                                            showFilters || filterType !== 'all' || filterStatus !== 'all' || filterDate !== 'all'
                                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Filters
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Expandable Filters */}
                                {showFilters && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Verification Type
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={filterType}
                                                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                                                >
                                                    <option value="all">All Types</option>
                                                    <option value="bvn">BVN Verification</option>
                                                    <option value="nin">NIN Verification</option>
                                                    <option value="phone">Phone Verification</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                                                >
                                                    <option value="all">All Status</option>
                                                    <option value="success">Successful</option>
                                                    <option value="failed">Failed</option>
                                                    <option value="pending">Pending</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Time Period
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={filterDate}
                                                    onChange={(e) => setFilterDate(e.target.value as FilterDate)}
                                                >
                                                    <option value="all">All Time</option>
                                                    <option value="today">Today</option>
                                                    <option value="week">This Week</option>
                                                    <option value="month">This Month</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Clear Filters */}
                                        {(filterType !== 'all' || filterStatus !== 'all' || filterDate !== 'all') && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        setFilterType('all');
                                                        setFilterStatus('all');
                                                        setFilterDate('all');
                                                    }}
                                                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                                                >
                                                    Clear all filters
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Verification Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Cost
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((verification) => (

                                        <tr key={verification.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">{verification.number}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(verification.number, 'number')}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                        {copiedText === 'number' && (
                                                            <span className="text-xs text-green-600">Copied!</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">{verification.name}</div>
                                                    {verification.reference && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <span>Ref: {verification.reference}</span>
                                                            <button
                                                                onClick={() => copyToClipboard(verification.reference!, 'reference')}
                                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                            {copiedText === 'reference' && (
                                                                <span className="text-green-600">Copied!</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(verification.type)}
                                                    <span className="text-sm font-medium text-gray-900 uppercase">
                                                        {verification.type}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(verification.verification_success)}
                                                    <span className={getStatusBadge(verification.verification_success)}>
                                                        {verification.verification_success}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {formatDate(verification.timestamp)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{verification.duration}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(verification.cost)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(verification)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(verification)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {/* Empty State */}
                                {currentItems.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No verifications found</h3>
                                        <p className="text-gray-600 mb-4">
                                            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterDate !== 'all'
                                                ? 'Try adjusting your search or filter criteria'
                                                : 'You haven\'t performed any verifications yet'
                                            }
                                        </p>
                                        {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterDate !== 'all') && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilterType('all');
                                                    setFilterStatus('all');
                                                    setFilterDate('all');
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                Clear Filters
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(indexOfLastItem, filteredVerifications.length)}
                                            </span>{' '}
                                            of <span className="font-medium">{filteredVerifications.length}</span> results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                                currentPage === pageNum
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Enhanced Details Modal */}
            {showDetailsModal && selectedVerification && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                {getTypeIcon(selectedVerification.type)}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {selectedVerification.type.toUpperCase()} Verification Details
                                    </h3>
                                    <p className="text-sm text-gray-600">ID: {selectedVerification.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Number</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-900">{selectedVerification.number}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(selectedVerification.number, 'modal-number')}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Name</span>
                                                <span className="text-sm text-gray-900">{selectedVerification.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Status</span>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(selectedVerification.verification_success)}
                                                    <span className={getStatusBadge(selectedVerification.verification_success)}>
                                                        {selectedVerification.verification_success}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Date & Time</span>
                                                <span className="text-sm text-gray-900">{formatDate(selectedVerification.timestamp)}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Duration</span>
                                                <span className="text-sm text-gray-900">{selectedVerification.duration}</span>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                <span className="text-sm font-medium text-gray-600">Cost</span>
                                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(selectedVerification.cost)}</span>
                                            </div>
                                            {selectedVerification.reference && (
                                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Reference</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-900">{selectedVerification.reference}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(selectedVerification.reference!, 'modal-reference')}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedVerification.provider && (
                                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                                    <span className="text-sm font-medium text-gray-600">Provider</span>
                                                    <span className="text-sm text-gray-900">{selectedVerification.provider}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Error Information */}
                                    {selectedVerification.error && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-red-600 mb-4">Error Details</h4>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <p className="text-sm text-red-700">{selectedVerification.error}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Response Data */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Response Data</h4>
                                    {selectedVerification.data ? (
                                        <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                                {JSON.stringify(selectedVerification.data, null, 2)}
                                            </pre>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">No response data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Close
                            </button>
                            {selectedVerification.data && (
                                <button
                                    onClick={() => {
                                        const dataStr = JSON.stringify(selectedVerification.data, null, 2);
                                        const blob = new Blob([dataStr], { type: 'application/json' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `verification-${selectedVerification.id}.json`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        window.URL.revokeObjectURL(url);
                                    }}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Export JSON
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Delete Confirmation Modal */}
            {showDeleteModal && verificationToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Verification</h3>
                                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="text-sm space-y-1">
                                    <div><span className="font-medium">Type:</span> {verificationToDelete.type.toUpperCase()}</div>
                                    <div><span className="font-medium">Number:</span> {verificationToDelete.number}</div>
                                    <div><span className="font-medium">Date:</span> {formatDate(verificationToDelete.timestamp)}</div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete this verification record? This will permanently remove it from your history.
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    {deleteLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationHistory;
