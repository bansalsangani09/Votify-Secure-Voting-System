import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import {
    FileText,
    Calendar as CalendarIcon,
    Settings,
    Users,
    CheckCircle2,
    X,
    ChevronRight,
    ChevronLeft,
    Save,
    Rocket,
    Loader2,
    Clock,
    AlertTriangle,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

import Step1BasicInfo from './Step1BasicInfo';
import Step2Schedule from './Step2Schedule';
import Step3Voting from './Step3Voting';
import Step4Candidates from './Step4Candidates';
import Step7Review from './Step7Review';

const CreateElectionWizard = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [currentStep, setCurrentStep] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const totalSteps = 5;

    const steps = [
        { id: 1, label: 'Basic Information', icon: FileText, desc: 'Title, descriptions and Category' },
        { id: 2, label: 'Schedule & Timeline', icon: CalendarIcon, desc: 'When should it start and end?' },
        { id: 3, label: 'Voting Configuration', icon: Settings, desc: 'Manage voting rules and security' },
        { id: 4, label: 'Candidates Setup', icon: Users, desc: 'Add participants for the election' },
        { id: 5, label: 'Review & Publish', icon: Rocket, desc: 'Final check before going live' },
    ];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Organization',
        visibility: 'Private',
        startDate: '',
        startTime: '10:00',
        endDate: '',
        endTime: '17:00',
        autoActivate: true,
        autoClose: true,
        resultTime: '',
        votingType: 'Single Choice',
        maxVotes: 1,
        anonymous: true,
        requireOTP: false,
        allowLiveResults: false,
        liveResultsEnabled: false,
        publicResultsVisible: false,
        candidates: []
    });

    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState('Saved');

    useEffect(() => {
        if (isOpen) {
            const timer = setInterval(() => {
                setSaveStatus('Saving...');
                setTimeout(() => setSaveStatus('Saved'), 1000);
            }, 10000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const currentStepInfo = steps.find(s => s.id === currentStep) || steps[0];

    const validateStep = (step) => {
        setError('');
        switch (step) {
            case 1:
                if (!formData.title.trim()) return 'Election title is required';
                if (!formData.description.trim()) return 'Description is required';
                return null;
            case 2:
                if (!formData.startDate || !formData.startTime) return 'Start date and time are required';
                if (!formData.endDate || !formData.endTime) return 'End date and time are required';

                const now = new Date();
                const start = new Date(`${formData.startDate}T${formData.startTime}`);
                const end = new Date(`${formData.endDate}T${formData.endTime}`);

                if (start < now) return 'Start time cannot be in the past';
                if (end <= start) return 'End time must be after start time';

                if (formData.resultTime) {
                    const result = new Date(formData.resultTime);
                    if (result <= end) return 'Result declaration time must be after end time';
                }
                return null;
            case 3:
                return null; // Defaults are sufficient
            case 4:
                if (formData.candidates.length < 2) return 'At least 2 candidates are required';
                if (formData.votingType === 'Multiple Choice' && formData.maxVotes > formData.candidates.length) {
                    return `For ${formData.maxVotes} selections, you must add at least ${formData.maxVotes} candidates to provide a choice.`;
                }
                const missingName = formData.candidates.some(c => !c.name.trim());
                if (missingName) return 'All candidates must have a name';
                return null;
            default:
                return null;
        }
    };

    const handlePublish = async () => {
        if (isPublishing) return;

        setIsPublishing(true);
        setError("");

        try {
            if (!executeRecaptcha) {
                setError("reCAPTCHA not initialized.");
                return;
            }

            const captchaToken = await executeRecaptcha("create_election");

            if (!captchaToken) {
                setError("CAPTCHA failed.");
                return;
            }

            console.log("CAPTCHA TOKEN:", captchaToken);

            const res = await api.post("/elections", {
                ...formData,
                captchaToken: captchaToken,
                uniqueRequestId: crypto.randomUUID(),
                requestTime: Date.now(), // 🔥 prevents duplicate reuse
            });

            if (res.data.success) {
                onClose();
                window.location.reload();
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to publish election."
            );
        } finally {
            setIsPublishing(false);
        }
    };

    const handleNext = () => {
        if (isPublishing) return;

        const validationError = validateStep(currentStep);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (currentStep === totalSteps) {
            handlePublish();
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            setError('');
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError('');
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return <Step1BasicInfo data={formData} setData={setFormData} />;
            case 2: return <Step2Schedule data={formData} setData={setFormData} />;
            case 3: return <Step3Voting data={formData} setData={setFormData} />;
            case 4: return <Step4Candidates data={formData} setData={setFormData} />;
            case 5: return <Step7Review data={formData} />;
            default: return <Step1BasicInfo data={formData} setData={setFormData} />;
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Wizard Header */}
                <header className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-none">Create Election</h1>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'Saved' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                {saveStatus} (Auto-saved)
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar for Desktop */}
                    <div className="hidden lg:flex items-center gap-8 px-12">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-3 relative">
                                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all
                    ${currentStep === step.id ? 'bg-indigo-600 text-white scale-110 shadow-xl shadow-indigo-100' :
                                        currentStep > step.id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}
                  `}>
                                    {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                                </div>
                                <div className="text-left">
                                    <p className={`text-[9px] uppercase font-black tracking-widest ${currentStep === step.id ? 'text-indigo-600' : 'text-gray-300'}`}>
                                        Step {index + 1}
                                    </p>
                                    <p className={`text-[11px] font-bold ${currentStep === step.id ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-white border border-indigo-100/50 transition-all active:scale-95 shadow-sm">
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Save Draft</span>
                    </button>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30">
                    <div className="w-full max-w-4xl mx-auto p-8">
                        {/* Step Info */}
                        <div className="mb-10 flex items-start gap-5 animate-in slide-in-from-left-4 duration-500">
                            <div className="bg-white p-4 rounded-3xl text-indigo-600 shadow-xl shadow-gray-200/50 border border-gray-100">
                                <currentStepInfo.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{currentStepInfo.label}</h2>
                                <p className="text-gray-500 text-base mt-1 font-medium">{currentStepInfo.desc}</p>
                            </div>
                        </div>

                        {/* Verified Owner Countdown for 'new' status */}
                        {user?.ownerStatus === 'new' && (
                            <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-[24px] flex items-center justify-between animate-in slide-in-from-top-2">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Growth Path</p>
                                        <p className="text-sm font-bold text-indigo-700">
                                            You are {Math.max(0, 10 - Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} days away from becoming a <span className="text-indigo-900">Verified Owner</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden sm:block px-4 py-2 bg-white rounded-2xl border border-indigo-100 shadow-sm">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Status: NEW</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className={`
                                mb-6 p-4 border-2 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-2
                                ${error.toLowerCase().includes('wait') || error.toLowerCase().includes('limit')
                                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                                    : error.toLowerCase().includes('restricted') || error.toLowerCase().includes('security')
                                        ? 'bg-rose-50 border-rose-100 text-rose-700'
                                        : 'bg-red-50 border-red-100 text-red-600'}
                            `}>
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    {error.toLowerCase().includes('wait') ? (
                                        <Clock className="w-4 h-4" />
                                    ) : error.toLowerCase().includes('restricted') ? (
                                        <ShieldAlert className="w-4 h-4" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" />
                                    )}
                                </div>
                                <p className="text-sm font-bold tracking-tight">{error}</p>
                            </div>
                        )}

                        {/* Form Area */}
                        <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-gray-200/40 border border-gray-100 border-b-8 border-b-indigo-600/5 min-h-[400px]">
                            {renderCurrentStep()}
                        </div>

                        <div className="h-8"></div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <footer className="bg-white border-t border-gray-100 px-8 py-6 flex items-center justify-between z-10 shrink-0">
                    <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 1 || isPublishing}
                            className={`
                  flex items-center gap-2 px-8 py-4 rounded-[20px] font-black text-xs transition-all uppercase tracking-widest
                  ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 active:scale-95'}
                `}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={isPublishing}
                            className={`
                  flex items-center gap-3 px-10 py-4 rounded-[20px] font-black text-xs transition-all shadow-xl active:scale-95 uppercase tracking-widest
                  ${currentStep === totalSteps
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200'
                                    : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}
                  ${isPublishing ? 'opacity-70 cursor-not-allowed' : ''}
                `}
                        >
                            {isPublishing ? 'Publishing...' : currentStep === totalSteps ? 'Publish Election' : 'Next Step'}
                            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === totalSteps ? <Rocket className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CreateElectionWizard;
