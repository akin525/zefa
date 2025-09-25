import React, {useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router';
import {
    Users, Search, CheckCircle, AlertTriangle, Loader2, ArrowLeft,
    Eye, Info, X, Copy, Download, MapPin, Mail,
    Shield, Clock, AlertCircle,
     TrendingUp,User, Building2,
    Briefcase, Hash, UserCheck
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import {verificationAPI} from '@/services/api';

// Updated type definitions for shareholder data based on actual API response
interface ShareholderData {
    id?: number;
    surname?: string;
    firstname?: string;
    other_name?: string;
    email?: string;
    business_email?: string;
    gender?: string;
    former_name?: string;
    city?: string;
    occupation?: string;
    corporation_name?: string;
    rc_number?: string;
    state?: string;
    lga?: string;
    form_type?: string;
    identity_number?: string;
    num_shares_alloted?: number;
    type_of_shares?: string;
    date_of_birth?: string;
    status?: string;
    date_of_appointment?: string;
    nationality?: string;
    address?: string;
    business_address?: string;
    postcode?: string;
    street_number?: string;
    affiliates_residential_address?: string;
    affiliates_psc_information?: string;
    affiliate_type_fk?: {
        id: number;
        name: string;
        description: string;
    };
    country_fk?: {
        id: number;
        name: string;
        code: string;
    };
    is_chairman?: boolean | null;
}

interface ShareholderVerificationResult {
    success: boolean;
    data?: ShareholderData[];
    message: string;
    verification_id?: number;
    company_info?: {
        name?: string;
        rc_number?: string;
        registration_date?: string;
    };
}

interface ShareholderVerificationResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ShareholderVerificationResult | null;
}

interface ShareholderFormData {
    rc_number: string;
    company_name: string;
}

interface ShareholderFormErrors {
    rc_number?: string;
    company_name?: string;
}

// Enhanced Modal Component for Shareholder Results
const ShareholderVerificationResultModal: React.FC<ShareholderVerificationResultModalProps> = ({
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
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `shareholder_details_${result.company_info?.rc_number || result.company_info?.name || 'result'}.json`;

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

    const getStatusBadge = (status: string | undefined) => {
        if (!status) {
            return (
                <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300">
          <AlertCircle className="w-3 h-3 mr-1.5"/>
          Unknown
        </span>
            );
        }

        const isActive = status.toLowerCase().includes('active') || status.toLowerCase().includes('current');

        return isActive ? (
            <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
        <CheckCircle className="w-3 h-3 mr-1.5"/>
        Active
      </span>
        ) : (
            <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
        <X className="w-3 h-3 mr-1.5"/>
        Inactive
      </span>
        );
    };

    // Helper function to get full name
    const getFullName = (shareholder: ShareholderData): string => {
        const parts = [
            shareholder.surname,
            shareholder.firstname,
            shareholder.other_name
        ].filter(part => part && part.trim() !== '');

        return parts.length > 0 ? parts.join(' ') : 'N/A';
    };

    // Helper function to calculate percentage holding
    const calculatePercentage = (shares: number, totalShares: number): string => {
        if (!shares || !totalShares) return 'N/A';
        return ((shares / totalShares) * 100).toFixed(2) + '%';
    };

    // Calculate total shares for percentage calculation
    const totalShares = result.data?.reduce((sum, shareholder) =>
        sum + (shareholder.num_shares_alloted || 0), 0) || 0;

    const renderShareholderCard = (shareholder: ShareholderData, index: number) => (
        <div key={shareholder.id || index}
             className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl hover:border-green-200 transition-all duration-300 relative overflow-hidden">
            {/* Decorative gradient */}
            <div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-indigo-500 to-green-500"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-indigo-100 rounded-xl">
                            <User className="w-6 h-6 text-green-600"/>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {getFullName(shareholder)}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        {getStatusBadge(shareholder.status)}
                        {shareholder.affiliate_type_fk?.name && (
                            <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                                {shareholder.affiliate_type_fk.name}
                            </span>
                        )}
                        {shareholder.is_chairman && (
                            <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                                Chairman
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => copyToClipboard(getFullName(shareholder), `name-${index}`)}
                    className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 group/copy"
                    title="Copy shareholder name"
                >
                    <Copy className="w-5 h-5 group-hover/copy:scale-110 transition-transform"/>
                </button>
            </div>

            {/* Enhanced Shareholder Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-indigo-100 rounded-lg">
                            <UserCheck className="w-5 h-5 text-green-600"/>
                        </div>
                        Personal Information
                    </h4>

                    <div className="space-y-4">
                        {shareholder.gender && (
                            <div
                                className="p-4 bg-gradient-to-r from-green-50 to-pink-50 rounded-xl border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-700">Gender</span>
                                    <span
                                        className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                        {shareholder.gender}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.date_of_birth && (
                            <div
                                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-700">Date of Birth</span>
                                    <span
                                        className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                        {formatDate(shareholder.date_of_birth)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.nationality && (
                            <div
                                className="p-4 bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-700">Nationality</span>
                                    <span
                                        className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                        {shareholder.nationality}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.occupation && (
                            <div
                                className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-orange-700">Occupation</span>
                                    <span
                                        className="text-sm text-orange-900 bg-white px-3 py-1 rounded-lg border border-orange-200">
                                        {shareholder.occupation}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.form_type && shareholder.identity_number && (
                            <div
                                className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">{shareholder.form_type}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono text-gray-900 bg-white px-3 py-1 rounded-lg border">
                                            {shareholder.identity_number}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(shareholder.identity_number!, `id-${index}`)}
                                            className="text-gray-400 hover:text-green-600 p-1 rounded transition-colors"
                                        >
                                            <Copy className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shareholding Information */}
                <div className="space-y-6">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 text-lg">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-green-600"/>
                        </div>
                        Shareholding Details
                    </h4>

                    <div className="space-y-4">
                        {shareholder.num_shares_alloted && (
                            <div
                                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-700">Shares Allotted</span>
                                    <span
                                        className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                        {shareholder.num_shares_alloted.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.num_shares_alloted && totalShares > 0 && (
                            <div
                                className="p-4 bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-700">Percentage Holding</span>
                                    <span
                                        className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                        {calculatePercentage(shareholder.num_shares_alloted, totalShares)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.type_of_shares && (
                            <div
                                className="p-4 bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-green-700">Share Type</span>
                                    <span
                                        className="text-sm text-green-900 bg-white px-3 py-1 rounded-lg border border-green-200">
                                        {shareholder.type_of_shares}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.date_of_appointment && (
                            <div
                                className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-orange-700">Appointment Date</span>
                                    <span
                                        className="text-sm text-orange-900 bg-white px-3 py-1 rounded-lg border border-orange-200">
                                        {formatDate(shareholder.date_of_appointment)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {shareholder.country_fk?.name && (
                            <div
                                className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-teal-700">Country</span>
                                    <span
                                        className="text-sm text-teal-900 bg-white px-3 py-1 rounded-lg border border-teal-200">
                                        {shareholder.country_fk.name}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Information */}
            {(shareholder.affiliates_residential_address || shareholder.address || shareholder.business_address ||
                shareholder.city || shareholder.state) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 mb-6 text-lg">
                        <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-red-600"/>
                        </div>
                        Address Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shareholder.affiliates_residential_address && (
                            <div
                                className="p-5 bg-gradient-to-br from-green-50 to-indigo-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    Residential Address
                                </span>
                                <span className="text-sm text-green-900 leading-relaxed">
                                    {shareholder.affiliates_residential_address}
                                </span>
                            </div>
                        )}

                        {shareholder.business_address && (
                            <div
                                className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    Business Address
                                </span>
                                <span className="text-sm text-green-900 leading-relaxed">
                                    {shareholder.business_address}
                                </span>
                            </div>
                        )}

                        {(shareholder.city || shareholder.state) && (
                            <div
                                className="p-5 bg-gradient-to-br from-green-50 to-pink-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3">Location</span>
                                <span className="text-sm text-green-900">
                                    {[shareholder.city, shareholder.state].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Contact Information */}
            {(shareholder.email || shareholder.business_email) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 flex items-center gap-3 mb-6 text-lg">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-cyan-100 rounded-lg">
                            <Mail className="w-5 h-5 text-green-600"/>
                        </div>
                        Contact Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shareholder.email && (
                            <div
                                className="p-5 bg-gradient-to-r from-green-50 to-indigo-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3">Email Address</span>
                                <a
                                    href={`mailto:${shareholder.email}`}
                                    className="text-sm text-green-900 hover:text-green-700 transition-colors underline decoration-green-300 hover:decoration-green-500"
                                >
                                    {shareholder.email}
                                </a>
                            </div>
                        )}

                        {shareholder.business_email && (
                            <div
                                className="p-5 bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl border border-green-200">
                                <span className="text-sm font-semibold text-green-700 block mb-3">Business Email</span>
                                <a
                                    href={`mailto:${shareholder.business_email}`}
                                    className="text-sm text-green-900 hover:text-green-700 transition-colors underline decoration-green-300 hover:decoration-green-500"
                                >
                                    {shareholder.business_email}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {copiedField.includes(index.toString()) && (
                <div
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600"/>
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
                <div className="relative p-8 bg-gradient-to-r from-green-600 via-indigo-600 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <Users className="w-8 h-8"/>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2">
                                    Shareholder Details
                                </h2>
                                <p className="text-green-100">
                                    {result.message} • Found {result.data?.length || 0} shareholder(s)
                                    {result.verification_id && ` • ID: ${result.verification_id}`}
                                </p>
                                {result.company_info && (
                                    <p className="text-green-200 text-sm mt-1">
                                        Company: {result.company_info.name} ({result.company_info.rc_number})
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={downloadAsJSON}
                                className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200"
                                title="Download as JSON"
                            >
                                <Download className="w-6 h-6"/>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-200"
                            >
                                <X className="w-6 h-6"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-br from-gray-50 to-white">
                    {result.data && result.data.length > 0 ? (
                        <div className="space-y-8">
                            {result.data.map((shareholder, index) => renderShareholderCard(shareholder, index))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div
                                className="p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl inline-block mb-6">
                                <AlertTriangle className="w-16 h-16 text-orange-600 mx-auto"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Shareholders Found</h3>
                            <p className="text-gray-600 text-lg">No shareholder information was found for the provided
                                company details.</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Modal Footer */}
                <div
                    className="flex items-center justify-between p-8 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Clock className="w-5 h-5"/>
                        <span className="font-medium">
                            Verification completed • {result.data?.length || 0} shareholder(s) found
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={downloadAsJSON}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-indigo-600 text-white rounded-xl hover:from-green-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                        >
                            <Download className="w-5 h-5"/>
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

export default function BusinessShareholderDetails(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    // Form state
    const [formData, setFormData] = useState<ShareholderFormData>({
        rc_number: searchParams.get('rc_number') || '',
        company_name: searchParams.get('company_name') || ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<ShareholderFormErrors>({});
    const [result, setResult] = useState<ShareholderVerificationResult | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    // Handle form input changes
    const handleInputChange = (field: keyof ShareholderFormData, value: string): void => {
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
        const newErrors: ShareholderFormErrors = {};

        // At least one field must be provided
        if (!formData.rc_number.trim() && !formData.company_name.trim()) {
            newErrors.rc_number = 'Business Id ';
            newErrors.company_name = 'Either Business ID or Company Name is required';
        }

        // Validate company name if provided
        if (formData.company_name.trim() && formData.company_name.trim().length < 2) {
            newErrors.company_name = 'Company name must be at least 2 characters';
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
            const payload: any = {};

            if (formData.rc_number.trim()) {
                payload.biz_id = formData.rc_number.trim().toUpperCase();
            }

            if (formData.company_name.trim()) {
                payload.company_name = formData.company_name.trim();
            }

            const response = await verificationAPI.getBusinessShareholders(payload);

            if (response.data.status) {
                setResult({
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Shareholder details retrieved successfully',
                    verification_id: response.data.verification_id,
                    company_info: response.data.company_info
                });
                setShowModal(true);
            } else {
                setResult({
                    success: false,
                    message: response.data.message || 'Failed to retrieve shareholder details'
                });
            }
        } catch (error: any) {
            console.error('Shareholder verification error:', error);
            setResult({
                success: false,
                message: error.response?.data?.message || 'An error occurred while retrieving shareholder details'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle back navigation
    const handleBack = (): void => {
        navigate('/dashboard/business-verification');
    };

    // Clear form
    const clearForm = (): void => {
        setFormData({
            rc_number: '',
            company_name: ''
        });
        setErrors({});
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader setSidebarOpen={setSidebarOpen}/>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={handleBack}
                                    className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600"/>
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Business Shareholder Details
                                    </h1>
                                    <p className="text-gray-600 mt-2">
                                        Retrieve detailed information about company shareholders and their holdings
                                    </p>
                                </div>
                            </div>

                            {/* Info Banner */}
                            <div
                                className="bg-gradient-to-r from-green-50 to-indigo-50 border border-green-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-green-100 rounded-xl">
                                        <Info className="w-6 h-6 text-green-600"/>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-900 mb-2">
                                            Shareholder Verification Information
                                        </h3>
                                        <ul className="text-green-800 space-y-1 text-sm">
                                            <li>• Provide either Business ID or Company Name to search for shareholders
                                            </li>
                                            <li>• Results include shareholding percentages, appointment dates, and
                                                contact information
                                            </li>
                                            <li>• All shareholder data is retrieved from official CAC records</li>
                                            <li>• You can download the results as JSON for your records</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Form */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
                            <div className="bg-gradient-to-r from-green-600 to-indigo-600 px-8 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Search className="w-6 h-6 text-white"/>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">
                                        Search Company Shareholders
                                    </h2>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Business ID Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Business ID
                                        </label>
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Hash className="h-5 w-5 text-gray-400"/>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.rc_number}
                                                onChange={(e) => handleInputChange('rc_number', e.target.value)}
                                                placeholder="Enter your Business ID"
                                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                                    errors.rc_number
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500'
                                                }`}
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.rc_number && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4"/>
                                                {errors.rc_number}
                                            </p>
                                        )}
                                    </div>

                                    {/* Company Name Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Company Name
                                        </label>
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building2 className="h-5 w-5 text-gray-400"/>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.company_name}
                                                onChange={(e) => handleInputChange('company_name', e.target.value)}
                                                placeholder="Enter company name"
                                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                                                    errors.company_name
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500'
                                                }`}
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.company_name && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4"/>
                                                {errors.company_name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div
                                    className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Note:</span> Provide either Business ID or Company
                                        Name to search
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={clearForm}
                                            disabled={loading}
                                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Clear Form
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || (!formData.rc_number.trim() && !formData.company_name.trim())}
                                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-indigo-600 text-white rounded-xl hover:from-green-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="w-5 h-5"/>
                                                    Search Shareholders
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Results Section */}
                        {result && !showModal && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                <div className={`px-8 py-6 ${
                                    result.success
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                        : 'bg-gradient-to-r from-red-600 to-rose-600'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            {result.success ? (
                                                <CheckCircle className="w-6 h-6 text-white"/>
                                            ) : (
                                                <AlertTriangle className="w-6 h-6 text-white"/>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-white">
                                            {result.success ? 'Search Completed' : 'Search Failed'}
                                        </h3>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <p className="text-gray-700 text-lg mb-6">
                                        {result.message}
                                    </p>

                                    {result.success && result.data && result.data.length > 0 && (
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-indigo-600 text-white rounded-xl hover:from-green-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-3"
                                        >
                                            <Eye className="w-5 h-5"/>
                                            View Shareholder Details ({result.data.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12">
                                <div className="text-center">
                                    <div
                                        className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                                        <Loader2 className="w-8 h-8 text-green-600 animate-spin"/>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Searching for Shareholders...
                                    </h3>
                                    <p className="text-gray-600">
                                        Please wait while we retrieve the shareholder information from CAC records.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div
                                className="bg-gradient-to-br from-green-50 to-indigo-100 rounded-2xl p-6 border border-green-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-600 rounded-xl">
                                        <Users className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-900">Comprehensive Data</h3>
                                        <p className="text-green-700 text-sm">Complete shareholder profiles</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-600 rounded-xl">
                                        <Shield className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-900">Official Records</h3>
                                        <p className="text-green-700 text-sm">Verified CAC information</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="bg-gradient-to-br from-green-50 to-pink-100 rounded-2xl p-6 border border-green-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-600 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-900">Real-time Access</h3>
                                        <p className="text-green-700 text-sm">Up-to-date shareholding data</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Results Modal */}
            <ShareholderVerificationResultModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                result={result}
            />
        </div>
    );
}
