// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    uint public winningProposalID;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    
    /// @notice workflow status 
    WorkflowStatus public workflowStatus;

    /// @notice list that will contain proposals 
    Proposal[] proposalsArray;

    /// @notice whilelist that will contain voters 
    mapping(address => Voter) voters;

    /// @notice Event triggered when a voter is registered
    /// @param voterAddress the voter's address 
    event VoterRegistered(address voterAddress);

    /// @notice Event triggered when the owner modify the workflow status
    /// @param previousStatus the previous workflow status
    /// @param newStatus the new workflow status 
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );

    /// @notice Event triggered when a proposal is registered
    /// @param proposalId the id of the registered proposal
    event ProposalRegistered(uint proposalId);

    /// @notice Event triggered when a proposal is registered
    /// @param voter the voter's address
    /// @param proposalId the id of the registered proposal
    event Voted(address voter, uint proposalId);

    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }

    // on peut faire un modifier pour les états

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice fetch data of a voter.
    /// @param _addr voter's address.
    /// @dev the caller must be a voter.
    /// @return Voter the voter's information.
    function getVoter(
        address _addr
    ) external view onlyVoters returns (Voter memory) {
        return voters[_addr];
    }

    /// @notice fetch a proposal.
    /// @param _id, the id of the proposal.
    /// @dev the caller must be authorized.
    /// @return Proposal, a representation of a proposal.
    function getOneProposal(
        uint _id
    ) external view onlyVoters returns (Proposal memory) {
        return proposalsArray[_id];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: //

    /// @notice store a new address in the whitelist.
    /// @param _addr the new voter's address.
    /// @dev can only be called by the owner.
    /// @dev emit a VoterRegistered event.
    function addVoter(address _addr) external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.RegisteringVoters,
            "Voters registration is not open yet"
        );
        require(voters[_addr].isRegistered != true, "Already registered");

        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    // ::::::::::::: PROPOSAL ::::::::::::: //

    /// @notice store a new proposition in the proposals Array.
    /// @notice register the author of the proposal in the proposalRegister mapping.
    /// @param _desc the description of the new proposition.
    /// @dev can only be called by a voter.
    /// @dev emit a ProposalRegistered event.
    function addProposal(string calldata _desc) external onlyVoters {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Proposals are not allowed yet"
        );
        require(
            keccak256(abi.encode(_desc)) != keccak256(abi.encode("")),
            "Vous ne pouvez pas ne rien proposer"
        ); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length - 1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /// @notice increment the voteCount attribute of a given proposal.
    /// @notice update the Voter structure of the caller (hasVoted, votedProposalId).
    /// @param _id, the id of the selected proposal.
    /// @dev can only be called by a voter.
    /// @dev emit a Voted event.
    function setVote(uint _id) external onlyVoters {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            "Voting session havent started yet"
        );
        require(voters[msg.sender].hasVoted != true, "You have already voted");
        require(_id < proposalsArray.length, "Proposal not found"); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /// @notice start the Proposal Registration Session.
    /// @dev can only be called by the owner.
    /// @dev update the workflowStatus variable.
    /// @dev emit a WorkflowStatusChange event.
    function startProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.RegisteringVoters,
            "Registering proposals cant be started now"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;

        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);

        emit WorkflowStatusChange(
            WorkflowStatus.RegisteringVoters,
            WorkflowStatus.ProposalsRegistrationStarted
        );
    }

    /// @notice stop the Proposal Registration Session.
    /// @dev can only be called by the owner.
    /// @dev update the workflowStatus variable.
    /// @dev emit a WorkflowStatusChange event.
    function endProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "Registering proposals havent started yet"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted,
            WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    /// @notice start the Voting Session.
    /// @dev can only be called by the owner.
    /// @dev update the workflowStatus variable.
    /// @dev emit a WorkflowStatusChange event.
    function startVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationEnded,
            "Registering proposals phase is not finished"
        );
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationEnded,
            WorkflowStatus.VotingSessionStarted
        );
    }

    /// @notice stop the Voting Session.
    /// @dev can only be called by the owner.
    /// @dev update the workflowStatus variable.
    /// @dev emit a WorkflowStatusChange event.
    function endVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            "Voting session havent started yet"
        );
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionStarted,
            WorkflowStatus.VotingSessionEnded
        );
    }

    /// @notice tally the votes.
    /// @dev can only be called by the owner.
    /// @dev update the workflowStatus variable.
    /// @dev call the setWinningProposalId() function.
    /// @dev emit a WorkflowStatusChange event.
    function tallyVotes() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionEnded,
            "Current status is not voting session ended"
        );
        uint _winningProposalId;
        for (uint256 p = 0; p < proposalsArray.length; p++) {
            if (
                proposalsArray[p].voteCount >
                proposalsArray[_winningProposalId].voteCount
            ) {
                _winningProposalId = p;
            }
        }
        winningProposalID = _winningProposalId;

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(
            WorkflowStatus.VotingSessionEnded,
            WorkflowStatus.VotesTallied
        );
    }
}
