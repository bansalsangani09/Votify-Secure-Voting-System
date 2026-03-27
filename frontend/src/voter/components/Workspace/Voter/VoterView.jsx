import React from 'react';
import VoterOverview from './tabs/VoterOverview';
import VoterVote from './tabs/VoterVote';
import ResultsTab from '../Shared/ResultsTab';
import VoterProof from './tabs/VoterProof';

const VoterView = ({ activeTab, electionData, onTabChange }) => {
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <VoterOverview data={electionData} onTabChange={onTabChange} />;
            case 'vote': return <VoterVote data={electionData} onTabChange={onTabChange} />;
            case 'results': return <ResultsTab data={electionData} isOwner={false} />;
            case 'proof': return <VoterProof data={electionData} />;
            default: return <VoterOverview data={electionData} onTabChange={onTabChange} />;
        }
    };

    return (
        <div className="py-8">
            {renderTabContent()}
        </div>
    );
};

export default VoterView;
