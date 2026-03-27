/**
 * Determines the access level for election results
 * @param {Object} election - Election object
 * @returns {string} - 'NONE', 'ADMIN_ONLY', 'ADMIN_OWNER', or 'PUBLIC'
 */
export const getResultAccess = (election) => {
    if (!election || election.status !== 'active') {
        return 'NONE';
    }

    if (!election.liveResultsEnabled) {
        return 'ADMIN_ONLY';
    }

    if (election.liveResultsEnabled && !election.publicResultsVisible) {
        return 'ADMIN_OWNER';
    }

    if (election.liveResultsEnabled && election.publicResultsVisible) {
        return 'PUBLIC';
    }

    return 'NONE';
};
