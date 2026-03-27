import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Lock,
    Mail,
    ShieldCheck,
    ArrowRight,
    Loader2,
    Fingerprint,
    Info,
    Eye,
    EyeOff
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleIcon from '../components/GoogleIcon';

const Login = () => {
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            setIsLoading(false);
            return;
        }

        // User requested 8-char validation in login too
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            setIsLoading(false);
            return;
        }

        try {
            if (!executeRecaptcha) {
                setError("ReCAPTCHA has not loaded yet. Please try again.");
                setIsLoading(false);
                return;
            }

            const recaptchaToken = await executeRecaptcha('login');

            const res = await login(formData.email, formData.password, recaptchaToken);

            if (!res.token) {
                setIsLoading(false);
                setError("Check your email for login link.");
                return;
            }

            if (res.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed.');
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        setIsLoading(true);
        setError('');
        try {
            // response.access_token is returned by useGoogleLogin
            const res = await googleLogin(response.access_token);
            if (res.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
            setIsLoading(false);
        }
    };

    const googleCustomLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google Identity Failure'),
        auto_select: false
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-inter selection:bg-indigo-500/30">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80"
                    alt="Background"
                    className="w-full h-full object-cover opacity-80 scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-950/80 to-indigo-950/70 mix-blend-multiply"></div>

                {/* Dynamic Overlay Glows */}
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] animate-pulse-slow delay-1000"></div>
            </div>

            {/* Glassmorphic Container */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[480px]"
            >
                <div className="bg-white/5 backdrop-blur-2xl px-8 py-10 sm:px-12 sm:py-14 rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">

                    {/* Interior Decorative Light */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/15 transition-all duration-700"></div>

                    {/* Header Branding */}
                    <div className="flex flex-col items-center mb-12">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="mb-6 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <img src="/logo.svg" alt="Votify Logo" className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-indigo-300 font-black uppercase tracking-[0.2em] text-[10px]">Login to your account</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 ml-1">
                                <Mail className="w-3 h-3" /> Email Address
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/40"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 ml-1">
                                    <Lock className="w-3 h-3" /> Password
                                </label>
                                <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/40"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center px-1">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 bg-white/5 border-white/20 rounded text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-[10px] font-black text-white/60 uppercase tracking-widest cursor-pointer select-none">
                                Remember me
                            </label>
                        </div>

                        {/* Message/Error Handling */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={`p-4 rounded-2xl flex items-start gap-3 shadow-lg transition-all ${
                                        error === "Check your email for login link."
                                            ? "bg-blue-600/20 border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                            : "bg-red-600/20 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                    }`}
                                >
                                    {error === "Check your email for login link." ? (
                                        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    ) : (
                                        <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <p className={`text-[11px] font-black uppercase tracking-wider leading-tight ${
                                        error === "Check your email for login link." ? "text-blue-200" : "text-red-200"
                                    }`}>
                                        {error}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 px-6 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-[0_12px_24px_rgba(255,255,255,0.2)] hover:shadow-[0_16px_32px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Enter Votify</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>

                        <div className="relative my-8 text-center flex items-center gap-4">
                            <span className="h-[1px] flex-1 bg-white/20"></span>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 whitespace-nowrap">Neural Sync</span>
                            <span className="h-[1px] flex-1 bg-white/20"></span>
                        </div>

                        {/* Custom Google Login Button */}
                        <div className="flex justify-center w-full">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => googleCustomLogin()}
                                className="w-full max-w-[320px] py-4 px-6 bg-[#1a1a1a] border border-white/10 text-white font-bold text-sm rounded-full shadow-2xl hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-3 group"
                            >
                                <GoogleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Continue with Google</span>
                            </motion.button>
                        </div>

                        <div className="text-center mt-10">
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                                New Voter?{' '}
                                <Link to="/register" className="text-white hover:text-indigo-400 font-black underline underline-offset-4 transition-colors">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Secure Footer Stats */}
                <div className="mt-8 flex justify-center gap-8 opacity-40">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white tracking-[0.3em]">
                        <ShieldCheck className="w-3.5 h-3.5" /> AES-256 Link
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-white tracking-[0.3em]">
                        <Fingerprint className="w-3.5 h-3.5" /> ID Verified
                    </div>
                </div>
            </motion.div>

            <style>{`
                @keyframes slow-zoom {
                    from { transform: scale(1); }
                    to { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s linear infinite alternate;
                }
                .animate-pulse-slow {
                    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.15; }
                    50% { opacity: 0.3; }
                }
                .delay-1000 { animation-delay: 1s; }
            `}</style>
        </div>
    );
};

export default Login;