import React, { useState, useContext } from 'react';
import { X, ChevronDown, HelpCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const JoinElectionModal = ({ isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleJoin = async () => {
        if (!code.trim()) return;

        try {
            setLoading(true);
            setError('');
            const res = await api.post('/elections/join', { joinCode: code });

            if (res.data.success) {
                onClose();
                setCode('');
                navigate(`/election/${res.data.electionId}`);
            }
        } catch (err) {
            console.error('Join Error:', err);
            setError(err.response?.data?.message || 'Failed to join election. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#f0f2f5] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">

                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-normal text-gray-800">Join election</h2>
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={!code.trim() || loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Join
                    </button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* User Info Card */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium text-gray-600 mb-4">Signed in as</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-medium uppercase">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{user?.name || 'User'}</p>
                                    <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code Input Card */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-base font-bold text-gray-800 mb-1">Election code</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Ask your organizer for the election code, then enter it here.
                        </p>

                        <div className="relative group max-w-md">
                            <input
                                type="text"
                                placeholder="Election code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-lg text-lg focus:outline-none focus:border-indigo-600 transition-all placeholder:text-gray-300 peer"
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="px-1 space-y-4">
                        <p className="text-sm font-bold text-gray-700">To sign in with an election code</p>
                        <ul className="space-y-3">
                            <li className="flex gap-3 items-start text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
                                <span>Use a verified account</span>
                            </li>
                            <li className="flex gap-3 items-start text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
                                <span>Use an election code with 5–8 letters or numbers, and no spaces or symbols</span>
                            </li>
                        </ul>
                        <p className="text-sm text-gray-500 pt-2 flex items-center gap-1.5">
                            If you have trouble joining the election, go to the <a href="#" className="text-indigo-600 font-bold hover:underline">Help Centre article</a> <HelpCircle className="w-4 h-4" />
                        </p>
                    </div>

                </div>

                {/* Sticky Mobile Footer (if needed) */}
                <div className="lg:hidden p-4 bg-white border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleJoin}
                        disabled={!code.trim() || loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Join
                    </button>
                </div>

            </div>
        </div>
    );
};

export default JoinElectionModal;
