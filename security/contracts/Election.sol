// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract ElectionFactory {

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        string joinCode;        // NOTE: should be hashed in production
        address creator;
    }

    uint256 public electionCount;

    mapping(uint256 => Election) public elections;
    mapping(uint256 => Candidate[]) private electionCandidates;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // ================= EVENTS =================

    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        uint256 startTime,
        uint256 endTime,
        address indexed creator
    );

    event VoteCast(
        uint256 indexed electionId,
        address indexed voter,
        uint256 candidateIndex,
        uint256 timestamp
    );

    event ElectionClosed(uint256 indexed electionId);

    // ================= MODIFIERS =================

    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].id != 0, "Election does not exist");
        _;
    }

    modifier onlyCreator(uint256 _electionId) {
        require(
            elections[_electionId].creator == msg.sender,
            "Only creator allowed"
        );
        _;
    }

    modifier electionActive(uint256 _electionId) {
        Election storage election = elections[_electionId];

        require(election.isActive, "Election is not active");
        require(block.timestamp >= election.startTime, "Election not started");
        require(block.timestamp <= election.endTime, "Election ended");

        _;
    }

    // ================= CREATE ELECTION =================

    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string memory _joinCode,
        string[] memory _candidateNames
    ) public returns (uint256) {

        require(_endTime > _startTime, "Invalid time range");
        require(_candidateNames.length >= 2, "Minimum 2 candidates");

        electionCount++;
        uint256 newElectionId = electionCount;

        elections[newElectionId] = Election({
            id: newElectionId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            joinCode: _joinCode,   // ⚠ In production: store keccak256 hash instead
            creator: msg.sender
        });

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            electionCandidates[newElectionId].push(
                Candidate({
                    name: _candidateNames[i],
                    voteCount: 0
                })
            );
        }

        emit ElectionCreated(
            newElectionId,
            _title,
            _startTime,
            _endTime,
            msg.sender
        );

        return newElectionId;
    }

    // ================= CAST VOTE =================

    function castVote(
        uint256 _electionId,
        uint256 _candidateIndex
    )
        public
        electionExists(_electionId)
        electionActive(_electionId)
    {
        require(
            !hasVoted[_electionId][msg.sender],
            "Already voted"
        );

        require(
            _candidateIndex < electionCandidates[_electionId].length,
            "Invalid candidate"
        );

        hasVoted[_electionId][msg.sender] = true;

        electionCandidates[_electionId][_candidateIndex].voteCount++;

        emit VoteCast(
            _electionId,
            msg.sender,
            _candidateIndex,
            block.timestamp
        );
    }

    // ================= VIEW FUNCTIONS =================

    function getElection(uint256 _electionId)
        public
        view
        electionExists(_electionId)
        returns (Election memory)
    {
        return elections[_electionId];
    }

    function getElectionCandidates(uint256 _electionId)
        public
        view
        electionExists(_electionId)
        returns (Candidate[] memory)
    {
        return electionCandidates[_electionId];
    }

    // ================= CLOSE ELECTION =================

    function closeElection(uint256 _electionId)
        public
        electionExists(_electionId)
        onlyCreator(_electionId)
    {
        elections[_electionId].isActive = false;

        emit ElectionClosed(_electionId);
    }
}