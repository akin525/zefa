import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
    Building, Search, CheckCircle, AlertTriangle, Loader2, ArrowLeft,
    Eye, Info, X, Copy, Download, MapPin,  Mail,
     FileText, Shield,  Clock, AlertCircle,
    Star, TrendingUp, Zap
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import { verificationAPI } from '@/services/api';

// Type definitions (keeping existing types)
interface BusinessVerificationData {
    approved_name?: string;
    nature_of_business_name?: string;
    registration_date?: string;
    rc_number?: string;
    id?: number;
    classification?: string;
    classification_id?: number;
    active?: boolean;
    registration_approved?: boolean | null;
    delisting_status?: string | null;
    company_type_name?: string | null;
    branch_address?: string | null;
    business_commencement_date?: string | null;
    head_office_address?: string | null;
    objectives?: string | null;
    city?: string | null;
    lga?: string | null;
    email?: string | null;
    address?: string | null;
    state?: string | null;
}

interface BusinessVerificationResult {
    success: boolean;
    data?: BusinessVerificationData[];
    message: string;
    verification_id?: number;
}

interface BusinessVerificationResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: BusinessVerificationResult | null;
}

interface BusinessFormData {
    name: string;
}

interface BusinessFormErrors {
    name?: string;
}

// Enhanced Modal Component with better design
const BusinessVerificationResultModal: React.FC<BusinessVerificationResultModalProps> = ({
                                                                                             isOpen,
                                                                                             onClose,
                                                                                             result
                                                                                         }) => {
    const [copiedField, setCopiedField] = useState<string>('');

    if (!isOpen || !result) return null;

    const copyToClipboard = (text: string, field: string): void => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
    };

    const downloadAsJSON = (): void => {
        if (!result.data) return;

        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `business_verification_${result.data[0]?.approved_name || result.data[0]?.rc_number || 'result'}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (active: boolean | undefined) => {
        if (active === undefined || active === null) {
            return (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300">
                    <AlertCircle className="w-3 h-3 mr-1.5" />
                    Unknown
                </span>
            );
        }

        return active ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                <CheckCircle className="w-3 h-3 mr-1.5" />
                Active
            </span>
        ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                <X className="w-3 h-3 mr-1.5" />
                Inactive
            </span>
        );
    };

    const renderBusinessCard = (business: BusinessVerificationData, index: number) => (
        <div key={index} className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-green-200 transition-all duration-300 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-green-500 to-green-500"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-indigo-100 rounded-xl">
                            <Building className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {business.approved_name || 'N/A'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        {getStatusBadge(business.active)}
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                            ID: {business.id || 'N/A'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => copyToClipboard(business.approved_name || '', `name-${index}`)}
                    className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 group/copy"
                    title="Copy business name"
                >
                    <Copy className="w-5 h-5 group-hover/copy:scale-110 transition-transform" />
                </button>
            </div>

            {/* Enhanced Business Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Registration Information */}
                <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        Registration Details
                    </h4>

                    <div className="space-y-4">
                        <div className="group/item p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">RC Number</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-mono text-gray-900 bg-white px-3 py-1 rounded-lg border">
                                        {business.rc_number || 'N/A'}
                                    </span>
                                    {business.rc_number && (
                                        <button
                                            onClick={() => copyToClipboard(business.rc_number!, `rc-${index}`)}
                                            className="text-gray-400 hover:text-green-600 p-1 rounded transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-green-700">Registration Date</span>
                                <span className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                    {formatDate(business.registration_date)}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-pink-50 rounded-xl border border-green-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-green-700">Classification</span>
                                <span className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                    {business.classification || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {business.business_commencement_date && (
                            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-orange-700">Commencement Date</span>
                                    <span className="text-sm text-orange-900 bg-white px-3 py-1 rounded-lg border border-orange-200">
                                        {formatDate(business.business_commencement_date)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Business Information */}
                <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-pink-100 rounded-lg">
                            <Building className="w-5 h-5 text-green-600" />
                        </div>
                        Business Information
                    </h4>

                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <span className="text-sm font-semibold text-green-700 block mb-2">Nature of Business</span>
                            <span className="text-sm text-green-900 bg-white px-3 py-2 rounded-lg border border-green-200 block">
                                {business.nature_of_business_name || 'N/A'}
                            </span>
                        </div>

                        {business.company_type_name && (
                            <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                                <span className="text-sm font-semibold text-teal-700 block mb-2">Company Type</span>
                                <span className="text-sm text-teal-900 bg-white px-3 py-2 rounded-lg border border-teal-200 block">
                                    {business.company_type_name}
                                </span>
                            </div>
                        )}

                        {business.objectives && (
                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-green-50 rounded-xl border border-indigo-200">
                                <span className="text-sm font-semibold text-indigo-700 block mb-2">Objectives</span>
                                <span className="text-sm text-indigo-900 bg-white px-3 py-2 rounded-lg border border-indigo-200 block leading-relaxed">
                                    {business.objectives}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enhanced Address Information */}
            {(business.head_office_address || business.branch_address || business.address || business.city || business.state) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 mb-6 text-lg">
                        <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-red-600" />
                        </div>
                        Address Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {business.head_office_address && (
                            <div className="p-5 bg-gradient-to-br from-green-50 to-indigo-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3 flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Head Office
                                </span>
                                <span className="text-sm text-green-900 leading-relaxed">{business.head_office_address}</span>
                            </div>
                        )}

                        {business.branch_address && (
                            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Branch Address
                                </span>
                                <span className="text-sm text-green-900 leading-relaxed">{business.branch_address}</span>
                            </div>
                        )}

                        {business.address && (
                            <div className="p-5 bg-gradient-to-br from-green-50 to-pink-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Address
                                </span>
                                <span className="text-sm text-green-900 leading-relaxed">{business.address}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {business.city && (
                                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                    <span className="text-sm font-semibold text-orange-700 block mb-2">City</span>
                                    <span className="text-sm text-orange-900">{business.city}</span>
                                </div>
                            )}

                            {business.state && (
                                <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                                    <span className="text-sm font-semibold text-teal-700 block mb-2">State</span>
                                    <span className="text-sm text-teal-900">{business.state}</span>
                                </div>
                            )}
                        </div>

                        {business.lga && (
                            <div className="p-5 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                                <span className="text-sm font-semibold text-gray-700 block mb-3">Local Government Area</span>
                                <span className="text-sm text-gray-900">{business.lga}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Contact Information */}
            {business.email && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 mb-6 text-lg">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-cyan-100 rounded-lg">
                            <Mail className="w-5 h-5 text-green-600" />
                        </div>
                        Contact Information
                    </h4>

                    <div className="p-5 bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200">
                        <span className="text-sm font-semibold text-green-700 block mb-3">Email Address</span>
                        <a
                            href={`mailto:${business.email}`}
                            className="text-sm text-green-900 hover:text-green-700 transition-colors underline decoration-green-300 hover:decoration-green-500"
                        >
                            {business.email}
                        </a>
                    </div>
                </div>
            )}

            {/* Enhanced Status Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-3 mb-6 text-lg">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    Status Information
                </h4>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <span className="text-sm font-semibold text-green-700 block mb-3">Registration Status</span>
                        <div className="flex items-center gap-2">
                            {business.registration_approved === null ? (
                                <span className="text-sm text-gray-600">N/A</span>
                            ) : business.registration_approved ? (
                                <>
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-900 font-medium">Approved</span>
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-900 font-medium">Not Approved</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-green-50 to-indigo-50 rounded-xl border border-green-200">
                        <span className="text-sm font-semibold text-green-700 block mb-3">Delisting Status</span>
                        <span className="text-sm text-green-900">
                            {business.delisting_status || 'Active'}
                        </span>
                    </div>
                </div>
            </div>

            {copiedField.includes(index.toString()) && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">✓ Copied to clipboard!</span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
                {/* Enhanced Modal Header */}
                <div className="relative p-8 bg-gradient-to-r from-green-600 via-green-600 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    Business Verification Results
                                </h2>
                                <p className="text-green-100">
                                    {result.message} • Found {result.data?.length || 0} result(s)
                                    {result.verification_id && ` • ID: ${result.verification_id}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadAsJSON}
                                className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200"
                                title="Download as JSON"
                            >
                                <Download className="w-6 h-6" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-br from-gray-50 to-white">
                    {result.data && result.data.length > 0 ? (
                        <div className="space-y-8">
                            {result.data.map((business, index) => renderBusinessCard(business, index))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl inline-block mb-6">
                                <AlertTriangle className="w-16 h-16 text-orange-600 mx-auto" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h3>
                            <p className="text-gray-600 text-lg">No business information was found for the provided name.</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Modal Footer */}
                <div className="flex items-center justify-between p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">
                            Verification completed • {result.data?.length || 0} business(es) found
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={downloadAsJSON}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-xl hover:from-green-700 hover:to-green-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                        >
                            <Download className="w-5 h-5" />
                            Download JSON
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function BusinessVerification(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    // Form state
    const [formData, setFormData] = useState<BusinessFormData>({
        name: searchParams.get('name') || ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<BusinessFormErrors>({});
    const [result, setResult] = useState<BusinessVerificationResult | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    // Handle form input changes
    const handleInputChange = (field: keyof BusinessFormData, value: string): void => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear specific field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: BusinessFormErrors = {};

        // Validate business name
        if (!formData.name.trim()) {
            newErrors.name = 'Business name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Business name must be at least 2 characters';
        } else if (formData.name.trim().length > 200) {
            newErrors.name = 'Business name must be less than 200 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const payload = {
                name: formData.name.trim()
            };

            const response = await verificationAPI.verifyBusiness(payload);

            if (response.data.status) {
                setResult({
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Business verification successful',
                    verification_id: response.data.verification_id
                });
                setShowModal(true);
            } else {
                setResult({
                    success: false,
                    message: response.data.message || 'Business verification failed'
                });
            }
        } catch (error: any) {
            console.error('Business verification error:', error);
            setResult({
                success: false,
                message: error.response?.data?.message || 'An error occurred during business verification'
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = (): void => {
        setFormData({
            name: ''
        });
        setErrors({});
        setResult(null);
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-indigo-100 flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader setSidebarOpen={setSidebarOpen}/>

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Business Verification Result Modal */}
                    <BusinessVerificationResultModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        result={result}
                    />

                    {/* Enhanced Page Header */}
                    <div className="mb-10">
                        <div className="flex items-center gap-6 mb-8">
                            <button
                                onClick={() => navigate(-1)}
                                className="group p-4 hover:bg-white/80 rounded-2xl transition-all duration-200 shadow-lg bg-white border border-gray-200 hover:border-green-300 hover:shadow-xl"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-green-600 transition-colors"/>
                            </button>
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-green-900 bg-clip-text text-transparent mb-3">
                                    Business Verification
                                </h1>
                                <p className="text-gray-600 text-xl">
                                    Verify business registration and company information instantly with our advanced verification system
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        {/* Enhanced Business Verification Form */}
                        <div className="xl:col-span-2">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-10 hover:shadow-2xl transition-all duration-300">
                                <div className="mb-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-gradient-to-br from-green-100 to-indigo-100 rounded-2xl">
                                            <Building className="w-8 h-8 text-green-600"/>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Business Information Lookup
                                        </h2>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        Enter the business name to retrieve comprehensive registration details,
                                        company status, and official documentation from our verified database.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Business Name Input */}
                                    <div className="space-y-3">
                                        <label
                                            htmlFor="businessName"
                                            className="block text-sm font-bold text-gray-900 mb-3"
                                        >
                                            Business Name *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="businessName"
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="Enter business or company name..."
                                                className={`
                                                    block w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 
                                                    bg-white border-2 rounded-2xl shadow-sm transition-all duration-200
                                                    focus:outline-none focus:ring-4 focus:ring-green-500/20 
                                                    ${errors.name
                                                    ? 'border-red-300 focus:border-red-500'
                                                    : 'border-gray-200 focus:border-green-500 hover:border-gray-300'
                                                }
                                                `}
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading || !formData.name.trim()}
                                            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Verifying Business...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="w-5 h-5" />
                                                    Verify Business
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            disabled={loading}
                                            className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Reset Form
                                        </button>
                                    </div>
                                </form>

                                {/* Inline Result Display */}
                                {result && !showModal && (
                                    <div className="mt-8 pt-8 border-t border-gray-200">
                                        {result.success ? (
                                            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                    <h3 className="text-lg font-bold text-green-900">Verification Successful</h3>
                                                </div>
                                                <p className="text-green-700 mb-4">{result.message}</p>
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                    View Details
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                                    <h3 className="text-lg font-bold text-red-900">Verification Failed</h3>
                                                </div>
                                                <p className="text-red-700">{result.message}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Information Panel */}
                        <div className="space-y-8">
                            {/* Feature Highlights */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-green-100 to-pink-100 rounded-xl">
                                        <Star className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Key Features</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Zap className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-green-900 mb-1">Instant Verification</h4>
                                            <p className="text-sm text-green-700">Get real-time business registration status and details</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Shield className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-green-900 mb-1">Verified Data</h4>
                                            <p className="text-sm text-green-700">Access official CAC registered business information</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-pink-50 rounded-xl border border-green-200">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FileText className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-green-900 mb-1">Comprehensive Reports</h4>
                                            <p className="text-sm text-green-700">Detailed business profiles with contact information</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Download className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-orange-900 mb-1">Export Options</h4>
                                            <p className="text-sm text-orange-700">Download verification results in JSON format</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Statistics */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Verification Stats</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-indigo-50 rounded-xl border border-green-200">
                                        <div className="text-2xl font-bold text-green-600 mb-1">99.9%</div>
                                        <div className="text-sm text-green-700">Accuracy Rate</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                        <div className="text-2xl font-bold text-green-600 mb-1">2s</div>
                                        <div className="text-sm text-green-700">Avg Response</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-pink-50 rounded-xl border border-green-200">
                                        <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                                        <div className="text-sm text-green-700">Availability</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                        <div className="text-2xl font-bold text-orange-600 mb-1">1M+</div>
                                        <div className="text-sm text-orange-700">Businesses</div>
                                    </div>
                                </div>
                            </div>

                            {/* Help & Support */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-green-100 to-cyan-100 rounded-xl">
                                        <Info className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Need Help?</h3>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Our business verification system searches through official CAC records to provide
                                        accurate and up-to-date business information.
                                    </p>

                                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-amber-900 mb-1">Search Tips</h4>
                                                <ul className="text-sm text-amber-800 space-y-1">
                                                    <li>• Use the exact registered business name</li>
                                                    <li>• Try variations if no results found</li>
                                                    <li>• Include "Limited", "Ltd", "PLC" if applicable</li>
                                                </ul>
                                            </div>
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

