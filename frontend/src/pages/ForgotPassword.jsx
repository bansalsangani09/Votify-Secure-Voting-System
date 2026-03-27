import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail,
    ShieldCheck,
    ArrowRight,
    Loader2,
    Info,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await axios.post('/api/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-inter selection:bg-indigo-500/30">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/C:/Users/Bansal/.gemini/antigravity/brain/5230df68-f25b-4674-9005-f18b42a59d39/register_bg_abstract_highpoly_1772534383725.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-80 scale-105 animate-slow-zoom"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-950/80 to-indigo-950/70 mix-blend-multiply"></div>
            </div>

            {/* Glassmorphic Container */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[480px]"
            >
                <div className="bg-white/5 backdrop-blur-2xl px-8 py-10 sm:px-12 sm:py-14 rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                    <div className="flex flex-col items-center mb-10">
                        <Link to="/login" className="self-start mb-6 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3" /> Back to Login
                        </Link>
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="p-3 bg-indigo-500 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-6"
                        >
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2 text-center">Reset Password</h2>
                        <p className="text-indigo-300 font-black uppercase tracking-[0.2em] text-[10px] text-center">Enter your email to reset</p>
                    </div>

                    {!success ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 ml-1">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/20 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/40"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="p-4 bg-red-600/20 border border-red-500/40 rounded-2xl flex items-start gap-3"
                                    >
                                        <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-black uppercase text-red-200 tracking-wider font-inter">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 px-6 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Sending Email...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Reset Password</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                <ShieldCheck className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2">Reset Email Sent</h3>
                            <p className="text-white/60 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                                If unauthorized activity is detected, additional verification may be required. Please check your transmission queue (inbox).
                            </p>
                            <Link to="/login" className="inline-block mt-8 text-indigo-400 hover:text-indigo-300 font-black uppercase text-[10px] tracking-[0.2em] transition-colors">
                                Return to Login
                            </Link>
                        </motion.div>
                    )}
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
            `}</style>
        </div>
    );
};

export default ForgotPassword;
