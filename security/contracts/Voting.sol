// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Voting {

    // electionId => voteHash => recorded
    mapping(uint256 => mapping(bytes32 => bool)) public voteExists;

    event VoteHashStored(
        uint256 indexed electionId,
        bytes32 indexed voteHash,
        uint256 timestamp
    );

    function storeVoteHash(
        uint256 _electionId,
        bytes32 _voteHash
    ) public {

        require(
            !voteExists[_electionId][_voteHash],
            "Vote already recorded"
        );

        voteExists[_electionId][_voteHash] = true;

        emit VoteHashStored(
            _electionId,
            _voteHash,
            block.timestamp
        );
    }

    function verifyVote(
        uint256 _electionId,
        bytes32 _voteHash
    ) public view returns (bool) {
        return voteExists[_electionId][_voteHash];
    }
}