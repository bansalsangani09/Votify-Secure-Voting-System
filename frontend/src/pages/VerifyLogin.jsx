import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const VerifyLogin = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [error, setError] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setError('Verification token is missing.');
                return;
            }

            try {
                const res = await axios.get(`/api/auth/verify-login?token=${token}`);

                if (res.data.success) {
                    // Set auth state
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    setUser(res.data.user);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                    setStatus('success');

                    // Redirect after a short delay
                    setTimeout(() => {
                        if (res.data.user.role === 'admin') {
                            navigate('/admin');
                        } else {
                            navigate('/dashboard');
                        }
                    }, 2000);
                } else {
                    setStatus('error');
                    setError(res.data.message || 'Verification failed.');
                }
            } catch (err) {
                setStatus('error');
                setError(err.response?.data?.message || 'Something went wrong during verification.');
            }
        };

        verify();
    }, [token, navigate, setUser]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-indigo-100 rounded-2xl">
                        <ShieldCheck className="w-10 h-10 text-indigo-600" />
                    </div>
                </div>

                {status === 'verifying' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">Verifying Login Link</h2>
                        <p className="text-slate-500">Please wait while we log you in...</p>
                        <div className="flex justify-center pt-4">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                        <h2 className="text-2xl font-bold text-teal-600">Login Successful</h2>
                        <p className="text-slate-500">You are logged in. Redirecting to your dashboard...</p>
                        <div className="flex justify-center pt-4 text-teal-500">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-center mb-2">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Login Failed</h2>
                        <p className="text-red-500 font-medium">{error}</p>
                        <p className="text-slate-500 text-sm">The link might be expired or already used. Please try logging in again.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-6 w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                        >
                            Return to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyLogin;
