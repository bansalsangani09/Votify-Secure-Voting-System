import React from 'react';
import OwnerOverview from './tabs/OwnerOverview';
import OwnerCandidates from './tabs/OwnerCandidates';
import OwnerPeople from './tabs/OwnerPeople';
import OwnerLive from './tabs/OwnerLive';
import ResultsTab from '../Shared/ResultsTab';
import OwnerSettings from './tabs/OwnerSettings';

const OwnerView = ({ activeTab, electionData, onTabChange, onUpdateElection, userId }) => {
    const isOwner = electionData?.admins?.some(a => a.userId?._id === userId && a.role === 'owner');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OwnerOverview data={electionData} onTabChange={onTabChange} onUpdateElection={onUpdateElection} />;
            case 'candidates': return <OwnerCandidates data={electionData} onUpdateElection={onUpdateElection} />;
            case 'people': return <OwnerPeople data={electionData} onUpdateElection={onUpdateElection} />;
            case 'live': return <OwnerLive data={electionData} />;
            case 'results': return <ResultsTab data={electionData} isOwner={true} />;
            case 'settings': return <OwnerSettings data={electionData} onUpdateElection={onUpdateElection} isOwner={isOwner} />;

            default: return <OwnerOverview data={electionData} onTabChange={onTabChange} />;
        }
    };

    return (
        <div className="py-8">
            {renderTabContent()}
        </div>
    );
};

export default OwnerView;
