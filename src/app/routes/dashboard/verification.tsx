import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
    FileText, User,  CreditCard, Shield,
    CheckCircle, AlertTriangle, Loader2, ArrowLeft,
    Eye, EyeOff, Info, X, Copy, Download, MapPin,
    Phone, Mail, Building, Calendar as CalendarIcon,
    Users, Heart
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import { verificationAPI } from '@/services/api';

// Type definitions
interface VerificationData {
    // Common fields
    nin?: string;
    bvn?: string;
    driver?: string;
    passport?: string;
    number?: string;

    // Personal information
    firstname?: string;
    surname?: string;
    middlename?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    title?: string;
    gender?: string;
    nationality?: string;
    religion?: string;
    profession?: string;
    maritalstatus?: string;
    maritalStatus?: string;

    // Dates
    birthdate?: string;
    dateOfBirth?: string;
    registrationDate?: string;

    // Contact information
    telephoneno?: string;
    phoneNumber1?: string;
    phoneNumber2?: string;
    email?: string;
    spoken_language?: string;
    ospokenlang?: string;

    // Address information
    residence_address?: string;
    residentialAddress?: string;
    residence_state?: string;
    residence_lga?: string;
    residence_town?: string;
    birthstate?: string;
    birthlga?: string;
    birthcountry?: string;
    self_origin_state?: string;
    self_origin_lga?: string;
    self_origin_place?: string;
    stateOfOrigin?: string;
    stateOfResidence?: string;
    lgaOfOrigin?: string;
    lgaOfResidence?: string;

    // Banking information
    enrollmentBank?: string;
    enrollmentBranch?: string;
    nameOnCard?: string;
    levelOfAccount?: string;
    watchListed?: string;

    // Identification
    vnin?: string;
    trackingId?: string;
    centralID?: string;
    userid?: string;
    educationallevel?: string;
    employmentstatus?: string;
    heigth?: string;
    residencestatus?: string;

    // Next of Kin
    nok_firstname?: string;
    nok_middlename?: string;
    nok_surname?: string;
    nok_address1?: string;
    nok_address2?: string;
    nok_state?: string;
    nok_lga?: string;
    nok_town?: string;
    nok_postalcode?: string;

    // Partner information
    pfirstname?: string;
    pmiddlename?: string;
    psurname?: string;

    // Images
    base64Image?: string;
    photo?: string;
    signature?: string;
}

interface VerificationResult {
    success: boolean;
    data?: VerificationData;
    message: string;
}

interface VerificationResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: VerificationResult | null;
    verificationType?: string;
}

interface FormData {
    type: string;
    number: string;
    firstname: string;
    lastname: string;
    dob: string;
}

interface FormErrors {
    type?: string;
    number?: string;
    firstname?: string;
    lastname?: string;
    dob?: string;
}

interface VerificationType {
    label: string;
    icon: React.ReactNode;
    placeholder: string;
    description: string;
    maxLength: number;
    requiresPersonalInfo: boolean;
}

interface VerificationTypes {
    [key: string]: VerificationType;
}

// Modal Component for displaying verification results
const VerificationResultModal: React.FC<VerificationResultModalProps> = ({
                                                                             isOpen,
                                                                             onClose,
                                                                             result,
                                                                             verificationType
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
        const exportFileDefaultName = `${verificationType}_verification_${result.data.nin || result.data.bvn || result.data.number || 'result'}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const formatFieldName = (key: string): string => {
        const fieldNameMap: Record<string, string> = {
            // NIN specific mappings
            'firstname': 'First Name',
            'surname': 'Surname',
            'middlename': 'Middle Name',
            'birthdate': 'Date of Birth',
            'birthstate': 'Birth State',
            'birthlga': 'Birth LGA',
            'birthcountry': 'Birth Country',
            'residence_address': 'Residence Address',
            'residence_state': 'Residence State',
            'residence_lga': 'Residence LGA',
            'residence_town': 'Residence Town',
            'self_origin_state': 'State of Origin',
            'self_origin_lga': 'LGA of Origin',
            'self_origin_place': 'Place of Origin',
            'maritalstatus': 'Marital Status',
            'educationallevel': 'Educational Level',
            'employmentstatus': 'Employment Status',
            'telephoneno': 'Phone Number',
            'spoken_language': 'Spoken Language',
            'ospokenlang': 'Other Spoken Language',
            'heigth': 'Height',
            'centralID': 'Central ID',
            'trackingId': 'Tracking ID',
            'residencestatus': 'Residence Status',
            'vnin': 'Virtual NIN',
            'userid': 'User ID',
            'pfirstname': 'Partner First Name',
            'pmiddlename': 'Partner Middle Name',
            'psurname': 'Partner Surname',
            'nok_firstname': 'Next of Kin First Name',
            'nok_middlename': 'Next of Kin Middle Name',
            'nok_surname': 'Next of Kin Surname',
            'nok_address1': 'Next of Kin Address 1',
            'nok_address2': 'Next of Kin Address 2',
            'nok_state': 'Next of Kin State',
            'nok_lga': 'Next of Kin LGA',
            'nok_town': 'Next of Kin Town',
            'nok_postalcode': 'Next of Kin Postal Code',
            // BVN mappings
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'middleName': 'Middle Name',
            'phoneNumber1': 'Phone Number 1',
            'phoneNumber2': 'Phone Number 2',
            'dateOfBirth': 'Date of Birth',
            'residentialAddress': 'Residential Address',
            'stateOfOrigin': 'State of Origin',
            'stateOfResidence': 'State of Residence',
            'lgaOfOrigin': 'LGA of Origin',
            'lgaOfResidence': 'LGA of Residence',
            'enrollmentBank': 'Enrollment Bank',
            'enrollmentBranch': 'Enrollment Branch',
            'registrationDate': 'Registration Date',
            'nameOnCard': 'Name on Card',
            'levelOfAccount': 'Level of Account',
            'watchListed': 'Watch Listed',

            //driver
            'first_name': 'First Name',
            'last_name': 'Last Name',
            'middle_name': 'Middle Name',
            'issued_date': 'Issue Date',
            'expiry_date': 'Expiry Date',
            'birth_date': 'Date of Birth',
        };

        return fieldNameMap[key] || key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([a-z])([A-Z])/g, '$1 $2');
    };

    const getFieldIcon = (key: string): React.ReactNode => {
        const iconMap: Record<string, React.ReactNode> = {
            // Personal info
            firstName: <User className="w-4 h-4" />,
            first_name: <User className="w-4 h-4" />,
            lastname: <User className="w-4 h-4" />,
            last_name: <User className="w-4 h-4" />,
            middleName: <User className="w-4 h-4" />,
            middle_name: <User className="w-4 h-4" />,
            firstname: <User className="w-4 h-4" />,
            surname: <User className="w-4 h-4" />,
            middlename: <User className="w-4 h-4" />,
            title: <User className="w-4 h-4" />,
            nameOnCard: <User className="w-4 h-4" />,

            // Contact info
            phoneNumber1: <Phone className="w-4 h-4" />,
            phoneNumber2: <Phone className="w-4 h-4" />,
            telephoneno: <Phone className="w-4 h-4" />,
            email: <Mail className="w-4 h-4" />,

            // Dates
            dateOfBirth: <CalendarIcon className="w-4 h-4" />,
            birthdate: <CalendarIcon className="w-4 h-4" />,
            birth_date: <CalendarIcon className="w-4 h-4" />,
            registrationDate: <CalendarIcon className="w-4 h-4" />,

            // Location
            residentialAddress: <MapPin className="w-4 h-4" />,
            residence_address: <MapPin className="w-4 h-4" />,
            stateOfOrigin: <MapPin className="w-4 h-4" />,
            stateOfResidence: <MapPin className="w-4 h-4" />,
            birthstate: <MapPin className="w-4 h-4" />,
            residence_state: <MapPin className="w-4 h-4" />,
            self_origin_state: <MapPin className="w-4 h-4" />,
            lgaOfOrigin: <MapPin className="w-4 h-4" />,
            lgaOfResidence: <MapPin className="w-4 h-4" />,
            birthlga: <MapPin className="w-4 h-4" />,
            residence_lga: <MapPin className="w-4 h-4" />,
            self_origin_lga: <MapPin className="w-4 h-4" />,

            // Banking
            enrollmentBank: <Building className="w-4 h-4" />,
            enrollmentBranch: <Building className="w-4 h-4" />,
            bvn: <CreditCard className="w-4 h-4" />,

            // ID
            nin: <Shield className="w-4 h-4" />,
            vnin: <Shield className="w-4 h-4" />,
            number: <FileText className="w-4 h-4" />,
            trackingId: <FileText className="w-4 h-4" />,
            centralID: <FileText className="w-4 h-4" />
        };
        return iconMap[key] || <Info className="w-4 h-4" />;
    };

    // const isImageField = (key: string): boolean => ['base64Image', 'photo', 'signature'].includes(key);
    const isSensitiveField = (key: string): boolean => ['bvn', 'nin', 'phoneNumber1', 'phoneNumber2', 'telephoneno'].includes(key);

    // Categorize fields based on verification type
    const getFieldCategories = (): Record<string, string[]> => {
        switch (verificationType) {
            case 'nin':
                return {
                    personal: ['title', 'firstname', 'surname', 'middlename', 'gender', 'birthdate', 'birthcountry', 'maritalstatus', 'nationality', 'religion', 'profession'],
                    contact: ['telephoneno', 'email', 'spoken_language'],
                    address: ['residence_address', 'residence_state', 'residence_lga', 'residence_town', 'birthstate', 'birthlga', 'self_origin_state', 'self_origin_lga', 'self_origin_place'],
                    identification: ['nin', 'vnin', 'trackingId', 'centralID', 'userid', 'educationallevel', 'employmentstatus', 'heigth', 'residencestatus'],
                    nextOfKin: ['nok_firstname', 'nok_middlename', 'nok_surname', 'nok_address1', 'nok_address2', 'nok_state', 'nok_lga', 'nok_town', 'nok_postalcode'],
                    partner: ['pfirstname', 'pmiddlename', 'psurname']
                };
            case 'bvn':
                return {
                    personal: ['firstName', 'lastName', 'middleName', 'nameOnCard', 'title', 'gender', 'dateOfBirth', 'maritalStatus', 'nationality'],
                    contact: ['phoneNumber1', 'phoneNumber2', 'email'],
                    address: ['residentialAddress', 'stateOfOrigin', 'stateOfResidence', 'lgaOfOrigin', 'lgaOfResidence'],
                    banking: ['bvn', 'nin', 'number', 'enrollmentBank', 'enrollmentBranch', 'levelOfAccount', 'registrationDate', 'watchListed']
                };
            case 'driver':
                return {
                    personal: ['first_name', 'last_name', 'middle_name', 'gender', 'birth_date'],
                };
            default:
                return {
                    general: []
                };
        }
    };

    const categories = getFieldCategories();

    const renderFieldSection = (title: string, icon: React.ReactNode, fields: string[]): React.ReactNode => {
        if (!result?.data) return null;

        const sectionFields = Object.entries(result.data)
            .filter(([key, value]) =>
                fields.includes(key) &&
                value !== null &&
                value !== '' &&
                value !== '****'
            );

        if (sectionFields.length === 0) return null;

        return (
            <div key={title}>
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionFields.map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    {getFieldIcon(key)}
                                    <span className="text-xs font-medium text-gray-600">
                                        {formatFieldName(key)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(String(value), key)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                            <p className={`text-sm font-medium break-words ${
                                key === 'watchListed' && value === 'NO' ? 'text-green-600' :
                                    key === 'watchListed' && value === 'YES' ? 'text-red-600' :
                                        'text-gray-900'
                            }`}>
                                {isSensitiveField(key) && value ?
                                    `${String(value).substring(0, 3)}****${String(value).substring(String(value).length - 3)}` :
                                    (String(value) || 'N/A')
                                }
                            </p>
                            {copiedField === key && (
                                <span className="text-xs text-green-600">Copied!</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {verificationType?.toUpperCase()} Verification Successful
                            </h2>
                            <p className="text-sm text-gray-600">{result.message}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={downloadAsJSON}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download as JSON"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Image */}
                        {result.data && (result.data.base64Image || result.data.photo) && (
                            <div className="lg:col-span-1">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Profile Photo</h3>
                                    <div className="aspect-square bg-white rounded-lg overflow-hidden border mb-4">
                                        <img
                                            src={`data:image/jpeg;base64,${result.data.base64Image || result.data.photo}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const nextSibling = target.nextSibling as HTMLElement;
                                                if (nextSibling) {
                                                    nextSibling.style.display = 'flex';
                                                }
                                            }}
                                        />
                                        <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: 'none'}}>
                                            <User className="w-16 h-16" />
                                        </div>
                                    </div>

                                    {/* Signature for NIN */}
                                    {result.data.signature && (
                                        <>
                                            <h3 className="font-medium text-gray-900 mb-3">Signature</h3>
                                            <div className="aspect-[3/1] bg-white rounded-lg overflow-hidden border">
                                                <img
                                                    src={`data:image/jpeg;base64,${result.data.signature}`}
                                                    alt="Signature"
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const nextSibling = target.nextSibling as HTMLElement;
                                                        if (nextSibling) {
                                                            nextSibling.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                                <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: 'none'}}>
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Information Sections */}
                        <div className={(result.data && (result.data.base64Image || result.data.photo)) ? 'lg:col-span-2' : 'lg:col-span-3'}>
                            <div className="space-y-6">
                                {/* Personal Information */}
                                {renderFieldSection('Personal Information', <User className="w-5 h-5" />, categories.personal)}

                                {/* Contact Information */}
                                {renderFieldSection('Contact Information', <Phone className="w-5 h-5" />, categories.contact)}

                                {/* Address Information */}
                                {renderFieldSection('Address Information', <MapPin className="w-5 h-5" />, categories.address)}

                                {/* Banking & Account Information (BVN) or Identification (NIN) */}
                                {verificationType === 'nin' ? (
                                    renderFieldSection('Identification Information', <Shield className="w-5 h-5" />, categories.identification)
                                ) : (
                                    renderFieldSection('Banking & Account Information', <Building className="w-5 h-5" />, categories.banking)
                                )}

                                {/* Next of Kin (NIN only) */}
                                {verificationType === 'nin' && renderFieldSection('Next of Kin Information', <Users className="w-5 h-5" />, categories.nextOfKin)}

                                {/* Partner Information (NIN only) */}
                                {verificationType === 'nin' && renderFieldSection('Partner Information', <Heart className="w-5 h-5" />, categories.partner)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {verificationType?.toUpperCase()} verification completed successfully
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={downloadAsJSON}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download JSON
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Verification(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        type: searchParams.get('type') || 'bvn',
        number: '',
        firstname: '',
        lastname: '',
        dob: ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [showNumber, setShowNumber] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);

    // Verification types configuration
    const verificationTypes: VerificationTypes = {
        bvn: {
            label: 'Bank Verification Number (BVN)',
            icon: <CreditCard className="w-5 h-5" />,
            placeholder: '12345678901',
            description: 'Verify identity using Bank Verification Number',
            maxLength: 11,
            requiresPersonalInfo: false
        },
        nin: {
            label: 'National Identification Number (NIN)',
            icon: <Shield className="w-5 h-5" />,
            placeholder: '12345678901',
            description: 'Verify identity using National Identification Number',
            maxLength: 11,
            requiresPersonalInfo: false
        },
        voters: {
            label: 'Voters Card',
            icon: <FileText className="w-5 h-5" />,
            placeholder: '12345678901',
            description: 'Verify identity using Voters Card Number',
            maxLength: 11,
            requiresPersonalInfo: false
        },
        passport: {
            label: 'International Passport',
            icon: <FileText className="w-5 h-5" />,
            placeholder: 'A12345678',
            description: 'Verify identity using International Passport',
            maxLength: 20,
            requiresPersonalInfo: true
        },
        driver: {
            label: 'Driver\'s License',
            icon: <CreditCard className="w-5 h-5" />,
            placeholder: 'ABC123456789',
            description: 'Verify identity using Driver\'s License',
            maxLength: 20,
            requiresPersonalInfo: true
        }
    };

    const currentType = verificationTypes[formData.type];

    // Handle form input changes
    const handleInputChange = (field: keyof FormData, value: string): void => {
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
        const newErrors: FormErrors = {};

        // Validate type
        if (!formData.type) {
            newErrors.type = 'Verification type is required';
        }

        // Validate number based on type
        if (!formData.number) {
            newErrors.number = 'Number is required';
        } else {
            const type = formData.type.toLowerCase();
            const number = formData.number.trim().replace(/\s+/g, ''); // Remove spaces

            switch (type) {
                case 'driver':
                case 'drivers_license':
                    // Nigerian driver's license format: ABC123456789 or similar
                    if (number.length < 6 || number.length > 20) {
                        newErrors.number = 'Driver license number must be between 6-20 characters';
                    } else if (!/^[A-Za-z0-9\-\/\s]+$/.test(formData.number)) {
                        newErrors.number = 'Driver license can contain letters, numbers, spaces, hyphens, and slashes';
                    }
                    break;

                case 'passport':
                case 'international_passport':
                    // Nigerian passport format: A12345678 or similar
                    if (number.length < 6 || number.length > 15) {
                        newErrors.number = 'Passport number must be between 6-15 characters';
                    } else if (!/^[A-Za-z0-9]+$/.test(number)) {
                        newErrors.number = 'Passport number can only contain letters and numbers (no spaces or special characters)';
                    }
                    break;

                case 'nin':
                    // Nigerian NIN: exactly 11 digits
                    if (number.length !== 11) {
                        newErrors.number = 'NIN must be exactly 11 digits';
                    } else if (!/^\d+$/.test(number)) {
                        newErrors.number = 'NIN must contain only digits';
                    }
                    break;

                case 'bvn':
                    // Nigerian BVN: exactly 11 digits
                    if (number.length !== 11) {
                        newErrors.number = 'BVN must be exactly 11 digits';
                    } else if (!/^\d+$/.test(number)) {
                        newErrors.number = 'BVN must contain only digits';
                    }
                    break;

                default:
                    // Default validation for other types
                    if (number.length !== 11) {
                        newErrors.number = 'Number must be exactly 11 digits';
                    } else if (!/^\d+$/.test(number)) {
                        newErrors.number = 'Number must contain only digits';
                    }
                    break;
            }
        }

        // Validate additional fields for passport and driver
        if (currentType.requiresPersonalInfo) {
            if (!formData.firstname.trim()) {
                newErrors.firstname = 'First name is required';
            } else if (formData.firstname.trim().length < 2) {
                newErrors.firstname = 'First name must be at least 2 characters';
            } else if (!/^[A-Za-z\s\-']+$/.test(formData.firstname.trim())) {
                newErrors.firstname = 'First name can only contain letters, spaces, hyphens, and apostrophes';
            }

            if (!formData.lastname.trim()) {
                newErrors.lastname = 'Last name is required';
            } else if (formData.lastname.trim().length < 2) {
                newErrors.lastname = 'Last name must be at least 2 characters';
            } else if (!/^[A-Za-z\s\-']+$/.test(formData.lastname.trim())) {
                newErrors.lastname = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
            }

            if (!formData.dob) {
                newErrors.dob = 'Date of birth is required';
            } else {
                // Validate age (must be at least 16 years old)
                const birthDate = new Date(formData.dob);
                const today = new Date();
                const baseAge = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                const age = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()))
                    ? baseAge - 1
                    : baseAge;

                if (age < 16) {
                    newErrors.dob = 'Must be at least 16 years old';
                } else if (age > 120) {
                    newErrors.dob = 'Please enter a valid date of birth';
                }
            }
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
            const payload: any = {
                type: formData.type,
                number: formData.number
            };

            // Add additional fields for passport and driver
            if (currentType.requiresPersonalInfo) {
                payload.firstname = formData.firstname;
                payload.lastname = formData.lastname;
                payload.dob = formData.dob;
            }

            const response = await verificationAPI.verify(payload);

            if (response.data.status) {
                setResult({
                    success: true,
                    data: response.data.data,
                    message: response.data.message || 'Verification successful'
                });
                setShowModal(true);
            } else {
                setResult({
                    success: false,
                    message: response.data.message || 'Verification failed'
                });
            }
        } catch (error: any) {
            console.error('Verification error:', error);
            setResult({
                success: false,
                message: error.response?.data?.message || 'An error occurred during verification'
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = (): void => {
        setFormData({
            type: 'bvn',
            number: '',
            firstname: '',
            lastname: '',
            dob: ''
        });
        setErrors({});
        setResult(null);
        setShowModal(false);
    };

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
                    {/* Verification Result Modal */}
                    <VerificationResultModal
                        isOpen={showModal}
                        onClose={() => setShowModal(false)}
                        result={result}
                        verificationType={formData.type}
                    />

                    {/* Page Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                    Identity Verification
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Verify customer identity using various document types
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Verification Form */}
                        <div className="xl:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Verification Type Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Verification Type
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(verificationTypes).map(([key, type]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => handleInputChange('type', key)}
                                                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                                                        formData.type === key
                                                            ? 'border-[#004d25] bg-green-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`p-2 rounded-lg ${
                                                            formData.type === key
                                                                ? 'bg-[#004d25] text-white'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {type.icon}
                                                        </div>
                                                        <span className="font-medium text-sm">
                                                            {type.label}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        {errors.type && (
                                            <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    {/* Selected Type Info */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h3 className="font-medium text-blue-900 mb-1">
                                                    {currentType.label}
                                                </h3>
                                                <p className="text-sm text-blue-700">
                                                    {currentType.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Number Input */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            {currentType.label} Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNumber ? 'text' : 'password'}
                                                value={formData.number}
                                                onChange={(e) => handleInputChange('number', e.target.value)}
                                                placeholder={currentType.placeholder}
                                                maxLength={currentType.maxLength}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#004d25] focus:border-transparent transition-colors ${
                                                    errors.number ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNumber(!showNumber)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.number && (
                                            <p className="mt-2 text-sm text-red-600">{errors.number}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Must be exactly 11 digits
                                        </p>
                                    </div>

                                    {/* Additional Fields for Passport and Driver */}
                                    {currentType.requiresPersonalInfo && (
                                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-3">
                                                Additional Information Required
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        First Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.firstname}
                                                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                                                        placeholder="Enter first name"
                                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#004d25] focus:border-transparent transition-colors ${
                                                            errors.firstname ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {errors.firstname && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.firstname}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Last Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.lastname}
                                                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                                                        placeholder="Enter last name"
                                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#004d25] focus:border-transparent transition-colors ${
                                                            errors.lastname ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {errors.lastname && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.lastname}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Date of Birth
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.dob}
                                                    onChange={(e) => handleInputChange('dob', e.target.value)}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#004d25] focus:border-transparent transition-colors ${
                                                        errors.dob ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.dob && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-[#004d25] text-white px-6 py-3 rounded-lg hover:bg-[#003d1f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="w-5 h-5" />
                                                    Verify Identity
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Reset Form
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Verification Status */}
                            {result && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Verification Status</h3>

                                    {result.success ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <CheckCircle className="w-6 h-6 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-green-900">Verification Successful</p>
                                                    <p className="text-sm text-green-700">{result.message}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setShowModal(true)}
                                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Full Details
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <AlertTriangle className="w-6 h-6 text-red-600" />
                                            <div>
                                                <p className="font-medium text-red-900">Verification Failed</p>
                                                <p className="text-sm text-red-700">{result.message}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Verification Tips */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Verification Tips</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Accurate Information</p>
                                            <p className="text-xs text-gray-600">Ensure all details match official records</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Valid Documents</p>
                                            <p className="text-xs text-gray-600">Use active and non-expired documents</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Secure Process</p>
                                            <p className="text-xs text-gray-600">All data is encrypted and secure</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Supported Documents */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Supported Documents</h3>
                                <div className="space-y-3">
                                    {Object.entries(verificationTypes).map(([key, type]) => (
                                        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="p-2 bg-white rounded-lg">
                                                {type.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{type.label}</p>
                                                <p className="text-xs text-gray-600">
                                                    {type.requiresPersonalInfo ? 'Requires additional info' : 'Number only'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-2">Security & Privacy</h3>
                                        <p className="text-sm text-blue-700 mb-3">
                                            Your data is protected with enterprise-grade security. We comply with all data protection regulations.
                                        </p>
                                        <ul className="text-xs text-blue-600 space-y-1">
                                            <li>• End-to-end encryption</li>
                                            <li>• No data storage after verification</li>
                                            <li>• GDPR compliant</li>
                                            <li>• Audit trail maintained</li>
                                        </ul>
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
