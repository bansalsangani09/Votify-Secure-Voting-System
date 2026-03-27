import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import ElectionHeader from '../components/Workspace/ElectionHeader';
import OwnerView from '../components/Workspace/Owner/OwnerView';
import VoterView from '../components/Workspace/Voter/VoterView';
import { Vote } from 'lucide-react';
import { motion } from 'framer-motion';

const ElectionWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isOwner, setIsOwner] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [electionData, setElectionData] = useState(null);

    useEffect(() => {
        const fetchElection = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/elections/${id}`);
                if (res.data.success) {
                    const data = res.data.data;
                    setElectionData(data);
                    const userId = user?.id || user?._id;
                    const admins = data.admins || [];
                    const isElectionAdmin = admins.some(a => (a.userId?._id || a.userId) === userId);
                    setIsOwner(isElectionAdmin || user?.role === 'admin');
                }
            } catch (err) {
                console.error('Failed to fetch election:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id && user) {
            fetchElection();
        }
    }, [id, user]);

    useEffect(() => {
        setActiveTab('overview');
    }, [id]);

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                        <Vote className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-slate-900 dark:text-white mb-2">Syncing Vote Ledger</p>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Establishing Secure Channel...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!electionData) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <div className="premium-card p-12 text-center max-w-md w-full border-dashed">
                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Vote className="w-10 h-10 text-rose-500 opacity-20" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Election Void</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                        The election you are looking for might have been deleted, or the access link is invalid. Please verify the ID and try again.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto min-h-screen pb-20 space-y-8 animate-in fade-in duration-1000">
            <ElectionHeader
                isOwner={isOwner}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                data={electionData}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative"
            >
                {isOwner ? (
                    <OwnerView
                        activeTab={activeTab}
                        electionData={electionData}
                        onTabChange={setActiveTab}
                        onUpdateElection={(newData) => setElectionData(newData)}
                        userId={user?.id || user?._id}
                    />
                ) : (
                    <VoterView activeTab={activeTab} electionData={electionData} onTabChange={setActiveTab} />
                )}
            </motion.div>
        </div>
    );
};

export default ElectionWorkspace;
