import React, { useState, useEffect, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreateChoiceModal from '../components/CreateChoiceModal';
import JoinElectionModal from '../components/JoinElectionModal';
import AgreementModal from '../components/AgreementModal';
import CreateElectionWizard from '../components/CreateElectionWizard/CreateElectionWizard';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const VoterLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [elections, setElections] = useState({ created: [], joined: [] });
    const { user } = useContext(AuthContext);

    const fetchWorkspaceData = async () => {
        try {
            const res = await api.get('/elections/my');
            if (res.data.success) {
                setElections({
                    created: res.data.data.created.map(e => ({ id: e._id, title: e.title, endDate: e.endDate, status: e.status })),
                    joined: res.data.data.joined.map(e => ({ id: e._id, title: e.title, endDate: e.endDate, status: e.status }))
                });
            }
        } catch (err) {
            console.error('Failed to fetch workspace elections:', err);
        }
    };

    useEffect(() => {
        if (user) fetchWorkspaceData();
    }, [user]);

    const handleJoinClick = () => {
        setIsActionModalOpen(false);
        setIsJoinModalOpen(true);
    };

    const handleCreateClick = () => {
        setIsActionModalOpen(false);
        setIsAgreementModalOpen(true);
    };

    const handleContinueToWizard = () => {
        setIsAgreementModalOpen(false);
        setIsWizardOpen(true);
    };

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-500 font-inter">
            <Navbar
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onAddClick={() => setIsActionModalOpen(true)}
                userRole={user?.role}
            />

            <Sidebar
                isOpen={isSidebarOpen}
                createdElections={elections.created}
                participatingElections={elections.joined}
            />

            {/* Main Content Area */}
            <main className={`
                pt-20 lg:pl-72 transition-all duration-500 min-h-screen
                ${isSidebarOpen ? 'blur-sm lg:blur-none pointer-events-none lg:pointer-events-auto' : ''}
            `}>
                <div className="p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
                    <Outlet context={{ openActionModal: () => setIsActionModalOpen(true), refreshData: fetchWorkspaceData }} />
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Action Modals */}
            <CreateChoiceModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                onJoinClick={handleJoinClick}
                onCreateClick={handleCreateClick}
            />

            <JoinElectionModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
            />

            <AgreementModal
                isOpen={isAgreementModalOpen}
                onClose={() => setIsAgreementModalOpen(false)}
                onContinue={handleContinueToWizard}
            />

            <CreateElectionWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
            />
        </div>
    );
};

export default VoterLayout;

