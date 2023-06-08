const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("Test Voting", function () {
    let voting, owner, addr1, addr2, addr3, addr4, unknown, addresses;

    describe("Deployment", function () {
        beforeEach(async function() {
            // fetch accounts once, instanciation of all those variables
            [owner, addr1, addr2, addr3, addr4, unknown, addresses] = await ethers.getSigners()
            // contract deployment
            let contract = await hre.ethers.getContractFactory("Voting")
            voting = await contract.deploy()
        })

        it('should be deployed with the right owner', async function() {
            let contractOwner = await voting.owner();
            assert.equal(contractOwner, owner.address);
        })

        it('should be deployed on status : RegisteringVoters', async function() {
            let currentWorkflowStatus = await voting.workflowStatus();
            assert.equal(currentWorkflowStatus.toString(), '0');
        })
        
        it('should be deployed without any voter', async function() {
            await expect(voting.getVoter(addr1.address)).to.be.reverted;
        })

        it('should be deployed without any proposal', async function() {
            await expect(voting.getOneProposal(0)).to.be.reverted;
        })

        it('should be deployed without winningProposal', async function() {
            let winninProposalID = await voting.winningProposalID();
            assert.equal(winninProposalID.toString(), '0');
        })

    });

    context("Voters Registration", function () {
        beforeEach(async function() {
            // contract deployment with a first voter registered
            let contract = await hre.ethers.getContractFactory("Voting")
            voting = await contract.deploy()
            // registering of a user
            await voting.addVoter(addr1.address)
        })

        describe("addVoter()", function () {

            it('should allow the owner to register a voter', async function() {
                await voting.addVoter(addr2.address)
                let voter = await voting.connect(addr2).getVoter(addr2.address);
                assert.isTrue(voter.isRegistered, "the voter is registered")
            })

            it('should emit a VoterRegistered event when owner register a voter', async function() {
                await expect(voting.addVoter(addr2.address))
                    .to.emit(voting,"VoterRegistered")
                    .withArgs(addr2.address);
            })

            it('should forbid the owner to register a voter twice', async function() {
                await expect(voting.addVoter(addr1.address)).to.be.revertedWith("Already registered");
            })

            it('should forbid a voter to register a voter', async function() {
                await expect(voting.connect(addr1).addVoter(addr2.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown voter to register a voter', async function() {
                await expect(voting.connect(unknown).addVoter(addr2.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("getVoter()", function () {

            it('should forbid the owner to get a voter', async function() {
                await expect(voting.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid an unknown person to get a voter', async function() {
                await expect(voting.connect(unknown.address).getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })
            
            it('should allow a voter to get a voter', async function() {
                let voter = await voting.connect(addr1).getVoter(addr1.address);
                assert.isTrue(voter.isRegistered, "the voter is registered")
            })

            it('should have not voted', async function() {
                let voter = await voting.connect(addr1).getVoter(addr1.address);
                assert.isFalse(voter.hasVoted, "the voter has not voted yet")
            })

            it('should indicate a non registered address as false', async function() {
                let voter = await voting.connect(addr1).getVoter(addr4.address);
                assert.isFalse(voter.isRegistered, false, "the voter is not registered")
            })
        });

        describe("addProposal()", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should forbid a voter person to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption')).to.be.revertedWith("Proposals are not allowed yet");
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("getOneProposal()", function () {
            it('should forbid the owner to get a proposal', async function() {
                await expect(voting.getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid a voter to get a proposal', async function() {
                await expect(voting.connect(addr1).getOneProposal(0)).to.be.reverted;
            })

            it('should forbid an unknown person to get a proposal', async function() {
                await expect(voting.connect(unknown).getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("setVote()", function () {
            it('should forbid the owner to set a vote', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid a voter to to set a vote', async function() {
                await expect(voting.connect(addr1).setVote(0)).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid an unknown person to set a vote', async function() {
                await expect(voting.connect(unknown).setVote(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("startProposalsRegistering()", function () {
            it('should allow the owner to start the Proposal Registration session', async function() {
                await voting.startProposalsRegistering();
                let workflowStatus = await voting.workflowStatus();
                assert.equal(workflowStatus.toString(), '1');
            })

            it('should emit a WorkflowStatusChange event when the owner start the Proposal Registration session', async function() {
                await expect(voting.startProposalsRegistering())
                    .to.emit(voting,"WorkflowStatusChange")
                    .withArgs(0, 1);
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endProposalsRegistering()", function () {
            it('should allow the owner to stop the Proposal Registration session', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("startVotingSession()", function () {
            it('should forbid the owner to start the Voting session', async function() {
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            })

            it('should forbid a voter to start the Voting session', async function() {
                await expect(voting.connect(addr1).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Voting session', async function() {
                await expect(voting.connect(unknown).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endVotingSession()", function () {
            it('should allow the owner to stop the Voting session', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid a voter to stop the Voting session', async function() {
                await expect(voting.connect(addr1).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Voting session', async function() {
                await expect(voting.connect(unknown).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("tallyVotes()", function () {
            it('should forbid the owner to tally votes', async function() {
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            })

            it('should forbid a voter to tally votes', async function() {
                await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to tally votes', async function() {
                await expect(voting.connect(unknown).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });
    });

    context("Proposal Registration started", function () {
        beforeEach(async function() {
            // ocntract deployment
            let contract = await hre.ethers.getContractFactory("Voting")
            voting = await contract.deploy();
            //voter registration
            await voting.addVoter(addr1.address);
            await voting.addVoter(addr2.address);
            await voting.addVoter(addr3.address);
            // starting the proposal registration session 
            await voting.startProposalsRegistering();
        })

        describe("workflowStatus", function() {
            it('should be on status : ProposalsRegistrationStarted', async function() {
                let currentWorkflowStatus = await voting.workflowStatus();
                assert.equal(currentWorkflowStatus.toString(), '1');
            })
        })

        describe("Genesis proposal", function() {
            it('should created a genesis proposal', async function() {
                let genesisProposal = await voting.connect(addr1).getOneProposal(0);
                await expect(genesisProposal.description).to.equal("GENESIS");
                await expect(genesisProposal.voteCount.toString()).to.equal('0');
            })
        })

        describe("addVoter", function () {
            it('should forbid the owner to register a voter', async function() {
                await expect(voting.addVoter(addr4.address)).to.be.revertedWith("Voters registration is not open yet");
            })

            it('should forbid a voter to register a voter', async function() {
                await expect(voting.connect(addr1).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown voter to register a voter', async function() {
                await expect(voting.connect(unknown).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("getVoter", function () {
            it('should forbid the owner to get a voter', async function() {
                await expect(voting.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid an unknown person to get a voter', async function() {
                await expect(voting.connect(unknown.address).getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })
            
            it('should allow a voter to get a voter', async function() {
                let voter = await voting.connect(addr1).getVoter(addr1.address);
                assert.isTrue(voter.isRegistered, "the voter is registered")
                assert.equal(voter.hasVoted, false)
                assert.equal(voter.votedProposalId.toString(), '0')
            })

            it('should indicate a non registered address as false', async function() {
                let voter = await voting.connect(addr1).getVoter(addr4.address);
                assert.isFalse(voter.isRegistered, false, "the voter is not registered")
            })
        });

        describe("addProposal", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should allow a voter to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption'))
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.description).to.equal('test proposision desctiption');
                await expect(proposal.voteCount.toString()).to.equal('0');
            })

            it('should emit a ProposalRegistered event when a proposal is submited', async function() {
                await expect(voting.connect(addr1).addProposal(addr2.address))
                    .to.emit(voting,"ProposalRegistered")
                    .withArgs(1);
            })

            it('should forbid a voter to add an empty proposal', async function() {
                await expect(voting.connect(addr1).addProposal('')).to.be.revertedWith('Vous ne pouvez pas ne rien proposer')
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("getOneProposal", function () {
            it('should forbid the owner to get a proposal', async function() {
                await expect(voting.getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })

            it('should allow a voter to get a proposal', async function() {
                await expect(voting.connect(addr3).addProposal('test proposision desctiption'))
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.description).to.equal('test proposision desctiption');
                await expect(proposal.voteCount.toString()).to.equal('0');
            })

            it('should not return an unexisting proposal', async function() {
                await expect(voting.connect(addr1).getOneProposal(1)).to.be.reverted;
            })

            it('should forbid an unknown person to get a proposal', async function() {
                await expect(voting.connect(unknown).getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("setVote()", function () {
            it('should forbid the owner to set a vote', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid a voter to to set a vote', async function() {
                await expect(voting.connect(addr1).setVote(0)).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid an unknown person to set a vote', async function() {
                await expect(voting.connect(unknown).setVote(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("startProposalsRegistering()", function () {
            it('should forbid the owner to start the Proposal Registration session', async function() {
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now")
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endProposalsRegistering()", function () {
            it('should allow the owner to stop the Proposal Registration session', async function() {
                await voting.endProposalsRegistering();
                let workflowStatus = await voting.workflowStatus();
                assert.equal(workflowStatus.toString(), '2');
            })

            it('should emit a WorkflowStatusChange event when the owner start the Proposal Registration session', async function() {
                await expect(voting.endProposalsRegistering())
                    .to.emit(voting,"WorkflowStatusChange")
                    .withArgs(1, 2);
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("startVotingSession()", function () {
            it('should forbid the owner to start the Voting session', async function() {
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            })

            it('should forbid a voter to start the Voting session', async function() {
                await expect(voting.connect(addr1).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Voting session', async function() {
                await expect(voting.connect(unknown).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endVotingSession()", function () {
            it('should allow the owner to stop the Voting session', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid a voter to stop the Voting session', async function() {
                await expect(voting.connect(addr1).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Voting session', async function() {
                await expect(voting.connect(unknown).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("tallyVotes()", function () {
            it('should forbid the owner to tally votes', async function() {
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            })

            it('should forbid a voter to tally votes', async function() {
                await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to tally votes', async function() {
                await expect(voting.connect(unknown).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });
    });

    context("Proposal Registration ended", function () {
        
        beforeEach(async function() {
            // contract deployment
            let contract = await hre.ethers.getContractFactory("Voting")
            voting = await contract.deploy();
            // voters registration
            await voting.addVoter(addr1.address);
            await voting.addVoter(addr2.address);
            await voting.addVoter(addr3.address);
            // starting the proposal registration session
            await voting.startProposalsRegistering();
            // proposals submition
            await voting.connect(addr1).addProposal('proposal 1')
            await voting.connect(addr2).addProposal('proposal 2')
            await voting.connect(addr3).addProposal('proposal 3')
            // ending the proposal registration session
            await voting.endProposalsRegistering();
        })

        describe("workflowStatus", function() {
            it('should be on status : ProposalsRegistrationEnded', async function() {
                let currentWorkflowStatus = await voting.workflowStatus();
                assert.equal(currentWorkflowStatus.toString(), '2');
            })
        })

        describe("addVoter", function () {
            it('should forbid the owner to register a voter', async function() {
                await expect(voting.addVoter(addr4.address)).to.be.revertedWith("Voters registration is not open yet");
            })

            it('should forbid a voter to register a voter', async function() {
                await expect(voting.connect(addr1).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown voter to register a voter', async function() {
                await expect(voting.connect(unknown).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("getVoter", function () {
            it('should forbid the owner to get a voter', async function() {
                await expect(voting.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid an unknown person to get a voter', async function() {
                await expect(voting.connect(unknown.address).getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })
            
            it('should allow a voter to get a voter', async function() {
                let voter = await voting.connect(addr1).getVoter(addr1.address);
                assert.isTrue(voter.isRegistered, "the voter is registered")
                assert.equal(voter.hasVoted, false)
                assert.equal(voter.votedProposalId.toString(), '0')
            })

            it('should indicate a non registered address as false', async function() {
                let voter = await voting.connect(addr1).getVoter(addr4.address);
                assert.isFalse(voter.isRegistered, false, "the voter is not registered")
            })
        });

        describe("addProposal", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should forbid a voter person to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption')).to.be.revertedWith("Proposals are not allowed yet");
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("getOneProposal", function () {
            it('should forbid the owner to get a proposal', async function() {
                await expect(voting.getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })

            it('should allow a voter to get a proposal', async function() {
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.description).to.equal('proposal 1');
                await expect(proposal.voteCount.toString()).to.equal('0');
            })

            it('should not return an unexisting proposal', async function() {
                await expect(voting.connect(addr1).getOneProposal(7)).to.be.reverted;
            })

            it('should forbid an unknown person to get a proposal', async function() {
                await expect(voting.connect(unknown).getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("setVote()", function () {
            it('should forbid the owner to set a vote', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid a voter to to set a vote', async function() {
                await expect(voting.connect(addr1).setVote(0)).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid an unknown person to set a vote', async function() {
                await expect(voting.connect(unknown).setVote(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("startProposalsRegistering()", function () {
            it('should forbid the owner to start the Proposal Registration session', async function() {
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now")
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });
        
        describe("endProposalsRegistering()", function () {
            it('should allow the owner to stop the Proposal Registration session', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("startVotingSession()", function () {
            it('should allow the owner to start the Voting session', async function() {
                await voting.startVotingSession();
                let workflowStatus = await voting.workflowStatus();
                assert.equal(workflowStatus.toString(), '3');
            })

            it('should emit a WorkflowStatusChange event when the owner start the Proposal Registration session', async function() {
                await expect(voting.startVotingSession())
                    .to.emit(voting,"WorkflowStatusChange")
                    .withArgs(2, 3);
            })
            
            it('should forbid a voter to start the Voting session', async function() {
                await expect(voting.connect(addr1).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Voting session', async function() {
                await expect(voting.connect(unknown).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endVotingSession()", function () {
            it('should allow the owner to stop the Voting session', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid a voter to stop the Voting session', async function() {
                await expect(voting.connect(addr1).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Voting session', async function() {
                await expect(voting.connect(unknown).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("tallyVotes()", function () {
            it('should forbid the owner to tally votes', async function() {
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            })

            it('should forbid a voter to tally votes', async function() {
                await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to tally votes', async function() {
                await expect(voting.connect(unknown).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });
    });

    context("Voting Session started", function () {
        beforeEach(async function() {
            // contract deployment
            let contract = await hre.ethers.getContractFactory("Voting")
            voting = await contract.deploy();
            // voters registration
            await voting.addVoter(addr1.address);
            await voting.addVoter(addr2.address);
            await voting.addVoter(addr3.address);
            // starting the proposal registration session
            await voting.startProposalsRegistering();
            // proposals submition
            await voting.connect(addr1).addProposal('proposal 1')
            await voting.connect(addr2).addProposal('proposal 2')
            await voting.connect(addr3).addProposal('proposal 3')
            // ending the proposal registration session
            await voting.endProposalsRegistering();
            // starting the voting session
            await voting.startVotingSession();
        })

        describe("workflowStatus", function() {
            it('should be on status : VotingSessionStarted', async function() {
                let currentWorkflowStatus = await voting.workflowStatus();
                assert.equal(currentWorkflowStatus.toString(), '3');
            })
        })

        describe("addVoter", function () {
            it('should forbid the owner to register a voter', async function() {
                await expect(voting.addVoter(addr4.address)).to.be.revertedWith("Voters registration is not open yet");
            })

            it('should forbid a voter to register a voter', async function() {
                await expect(voting.connect(addr1).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown voter to register a voter', async function() {
                await expect(voting.connect(unknown).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("addProposal", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should forbid a voter person to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption')).to.be.revertedWith("Proposals are not allowed yet");
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("setVote()", function () {
            it('should forbid the owner to set a vote', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("You're not a voter");
            })

            it('should allow a voter to set a vote', async function() {
                await expect(voting.connect(addr1).setVote(1))
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.voteCount.toString()).to.equal('1');
            })

            it('should update the voter structure', async function() {
                await expect(voting.connect(addr1).setVote(1))
                let voter = await voting.connect(addr1).getVoter(addr1.address);
                assert.equal(voter.hasVoted, true);
                assert.equal(voter.votedProposalId.toString(), '1');
            })

            it('should emit a Voted event when a vote is submited', async function() {
                await expect(voting.connect(addr1).setVote(1))
                    .to.emit(voting,"Voted")
                    .withArgs(addr1.address, 1);
            })

            it('should forbid a voter to set a vote twice', async function() {
                await expect(voting.connect(addr1).setVote(1))
                await expect(voting.connect(addr1).setVote(1)).to.be.revertedWith("You have already voted");
            })

            it('should forbid a voter to set a vote twice', async function() {
                await expect(voting.connect(addr1).setVote(17)).to.be.revertedWith("Proposal not found");
            })

            it('should forbid an unknown person to set a vote', async function() {
                await expect(voting.connect(unknown).setVote(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("getVoter", function () {
            it('should forbid the owner to get a voter', async function() {
                await expect(voting.getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid an unknown person to get a voter', async function() {
                await expect(voting.connect(unknown.address).getVoter(addr1.address)).to.be.revertedWith("You're not a voter");
            })
            
            it('should allow a voter to get a voter', async function() {
                let voter = await voting.connect(addr1).getVoter(addr1.address);
                assert.isTrue(voter.isRegistered, "the voter is registered")
                assert.equal(voter.hasVoted, false)
                assert.equal(voter.votedProposalId.toString(), '0')
            })

            it('should indicate a non registered address as false', async function() {
                let voter = await voting.connect(addr1).getVoter(addr4.address);
                assert.isFalse(voter.isRegistered, false, "the voter is not registered")
            })
        });

        describe("getOneProposal", function () {
            it('should forbid the owner to get a proposal', async function() {
                await expect(voting.getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })

            it('should allow a voter to get a proposal', async function() {
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.description).to.equal('proposal 1');
                await expect(proposal.voteCount.toString()).to.equal('0');
            })

            it('should return the correct voteCount', async function() {
                await voting.connect(addr1).setVote(1);
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.voteCount.toString()).to.equal('1');
            })

            it('should not return an unexisting proposal', async function() {
                await expect(voting.connect(addr1).getOneProposal(7)).to.be.reverted;
            })

            it('should forbid an unknown person to get a proposal', async function() {
                await expect(voting.connect(unknown).getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("startProposalsRegistering()", function () {
            it('should forbid the owner to start the Proposal Registration session', async function() {
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now")
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endProposalsRegistering()", function () {
            it('should allow the owner to stop the Proposal Registration session', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("startVotingSession()", function () {
            it('should forbid the owner to start the Voting session', async function() {
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            })

            it('should forbid a voter to start the Voting session', async function() {
                await expect(voting.connect(addr1).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Voting session', async function() {
                await expect(voting.connect(unknown).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endVotingSession()", function () {
            it('should allow the owner to stastoprt the Voting session', async function() {
                await voting.endVotingSession();
                let workflowStatus = await voting.workflowStatus();
                assert.equal(workflowStatus.toString(), '4');
            })

            it('should emit a WorkflowStatusChange event when the owner stop the Voting session', async function() {
                await expect(voting.endVotingSession())
                    .to.emit(voting,"WorkflowStatusChange")
                    .withArgs(3, 4);
            })

            it('should forbid a voter to stop the Voting session', async function() {
                await expect(voting.connect(addr1).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Voting session', async function() {
                await expect(voting.connect(unknown).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("tallyVotes()", function () {
            it('should forbid the owner to tally votes', async function() {
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            })

            it('should forbid a voter to tally votes', async function() {
                await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to tally votes', async function() {
                await expect(voting.connect(unknown).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });
    });
    
    context("Voting Session Ended", function () {
        beforeEach(async function() {
            // contract deployment
            let contract = await hre.ethers.getContractFactory("Voting")
            voting = await contract.deploy();
            // voters registration
            await voting.addVoter(addr1.address);
            await voting.addVoter(addr2.address);
            await voting.addVoter(addr3.address);
            await voting.startProposalsRegistering();
            // proposals submition
            await voting.connect(addr1).addProposal('proposal 1')
            await voting.connect(addr2).addProposal('proposal 2')
            await voting.connect(addr3).addProposal('proposal 3')
            // ending of the proposal registration session
            await voting.endProposalsRegistering();
            // starting of the voting session
            await voting.startVotingSession();
            // votes submition
            await voting.connect(addr1).setVote(1)
            await voting.connect(addr2).setVote(1)
            await voting.connect(addr3).setVote(1)
            // ending of the voting session
            await voting.endVotingSession();
        })

        describe("workflowStatus", function() {
            it('should be on status : VotingSessionStarted', async function() {
                let currentWorkflowStatus = await voting.workflowStatus();
                assert.equal(currentWorkflowStatus.toString(), '4');
            })
        })

        describe("addVoter", function () {
            it('should forbid the owner to register a voter', async function() {
                await expect(voting.addVoter(addr4.address)).to.be.revertedWith("Voters registration is not open yet");
            })

            it('should forbid a voter to register a voter', async function() {
                await expect(voting.connect(addr1).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown voter to register a voter', async function() {
                await expect(voting.connect(unknown).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("addProposal", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should forbid a voter person to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption')).to.be.revertedWith("Proposals are not allowed yet");
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("addProposal", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should forbid a voter person to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption')).to.be.revertedWith("Proposals are not allowed yet");
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("getOneProposal", function () {
            it('should forbid the owner to get a proposal', async function() {
                await expect(voting.getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })

            it('should allow a voter to get a proposal', async function() {
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.description).to.equal('proposal 1');
            })

            it('should return the correct voteCount', async function() {
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.voteCount.toString()).to.equal('3');
            })

            it('should not return an unexisting proposal', async function() {
                await expect(voting.connect(addr1).getOneProposal(7)).to.be.reverted;
            })

            it('should forbid an unknown person to get a proposal', async function() {
                await expect(voting.connect(unknown).getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("setVote()", function () {
            it('should forbid the owner to set a vote', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid a voter to to set a vote', async function() {
                await expect(voting.connect(addr1).setVote(0)).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid an unknown person to set a vote', async function() {
                await expect(voting.connect(unknown).setVote(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("startProposalsRegistering()", function () {
            it('should forbid the owner to start the Proposal Registration session', async function() {
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now")
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endProposalsRegistering()", function () {
            it('should allow the owner to stop the Proposal Registration session', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("startVotingSession()", function () {
            it('should forbid the owner to start the Voting session', async function() {
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            })

            it('should forbid a voter to start the Voting session', async function() {
                await expect(voting.connect(addr1).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Voting session', async function() {
                await expect(voting.connect(unknown).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endVotingSession()", function () {
            it('should allow the owner to stop the Voting session', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid a voter to stop the Voting session', async function() {
                await expect(voting.connect(addr1).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Voting session', async function() {
                await expect(voting.connect(unknown).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("tallyVotes()", function () {
            it('should allow the owner to tally votes', async function() {
                await voting.tallyVotes();
                let workflowStatus = await voting.workflowStatus();
                assert.equal(workflowStatus.toString(), '5');
            })

            it('should emit a WorkflowStatusChange event when the owner tally votes', async function() {
                await expect(voting.tallyVotes())
                    .to.emit(voting,"WorkflowStatusChange")
                    .withArgs(4, 5);
            })

            it('should set the right winningProposalID', async function() {
                await expect(voting.tallyVotes());
                let winningProposalID = await voting.winningProposalID();
                assert.equal(winningProposalID.toString(), '1');
            })

            it('should forbid a voter to tally votes', async function() {
                await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to tally votes', async function() {
                await expect(voting.connect(unknown).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });
    });

    context("Votes Tallied", function () {
        beforeEach(async function() {
            // contract deployment
            let contract = await hre.ethers.getContractFactory("Voting")
            voting = await contract.deploy();
            // voters registration
            await voting.addVoter(addr1.address);
            await voting.addVoter(addr2.address);
            await voting.addVoter(addr3.address);
            await voting.startProposalsRegistering();
            // proposals submition
            await voting.connect(addr1).addProposal('proposal 1')
            await voting.connect(addr2).addProposal('proposal 2')
            await voting.connect(addr3).addProposal('proposal 3')
            // ending of the proposal registration session
            await voting.endProposalsRegistering();
            // starting of the voting session
            await voting.startVotingSession();
            // votes submition
            await voting.connect(addr1).setVote(1)
            await voting.connect(addr2).setVote(1)
            await voting.connect(addr3).setVote(1)
            // ending of the voting session
            await voting.endVotingSession();
            // valying votes
            await voting.tallyVotes();
        })

        describe("workflowStatus", function() {
            it('should be on status : VotingSessionStarted', async function() {
                let currentWorkflowStatus = await voting.workflowStatus();
                assert.equal(currentWorkflowStatus.toString(), '5');
            })
        })

        describe("addVoter", function () {
            it('should forbid the owner to register a voter', async function() {
                await expect(voting.addVoter(addr4.address)).to.be.revertedWith("Voters registration is not open yet");
            })

            it('should forbid a voter to register a voter', async function() {
                await expect(voting.connect(addr1).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown voter to register a voter', async function() {
                await expect(voting.connect(unknown).addVoter(addr4.address)).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("addProposal", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should forbid a voter person to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption')).to.be.revertedWith("Proposals are not allowed yet");
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("addProposal", function () {
            it('should forbid the owner to add a proposal', async function() {
                await expect(voting.addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
            
            it('should forbid a voter person to add a proposal', async function() {
                await expect(voting.connect(addr1).addProposal('test proposision desctiption')).to.be.revertedWith("Proposals are not allowed yet");
            })

            it('should forbid an unknown person to add a proposal', async function() {
                await expect(voting.connect(unknown).addProposal('test proposision desctiption')).to.be.revertedWith("You're not a voter");
            })
        });

        describe("getOneProposal", function () {
            it('should forbid the owner to get a proposal', async function() {
                await expect(voting.getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })

            it('should allow a voter to get a proposal', async function() {
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.description).to.equal('proposal 1');
            })

            it('should return the correct voteCount', async function() {
                let proposal = await voting.connect(addr1).getOneProposal(1)
                await expect(proposal.voteCount.toString()).to.equal('3');
            })

            it('should not return an unexisting proposal', async function() {
                await expect(voting.connect(addr1).getOneProposal(7)).to.be.reverted;
            })

            it('should forbid an unknown person to get a proposal', async function() {
                await expect(voting.connect(unknown).getOneProposal(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("setVote()", function () {
            it('should forbid the owner to set a vote', async function() {
                await expect(voting.setVote(0)).to.be.revertedWith("You're not a voter");
            })

            it('should forbid a voter to to set a vote', async function() {
                await expect(voting.connect(addr1).setVote(0)).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid an unknown person to set a vote', async function() {
                await expect(voting.connect(unknown).setVote(0)).to.be.revertedWith("You're not a voter");
            })
        });

        describe("startProposalsRegistering()", function () {
            it('should forbid the owner to start the Proposal Registration session', async function() {
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now")
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endProposalsRegistering()", function () {
            it('should allow the owner to stop the Proposal Registration session', async function() {
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
            })

            it('should forbid a voter to start the Proposal Registration session', async function() {
                await expect(voting.connect(addr1).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Proposal Registration session', async function() {
                await expect(voting.connect(unknown).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("startVotingSession()", function () {
            it('should forbid the owner to start the Voting session', async function() {
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished");
            })

            it('should forbid a voter to start the Voting session', async function() {
                await expect(voting.connect(addr1).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to start the Voting session', async function() {
                await expect(voting.connect(unknown).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("endVotingSession()", function () {
            it('should allow the owner to stop the Voting session', async function() {
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet");
            })

            it('should forbid a voter to stop the Voting session', async function() {
                await expect(voting.connect(addr1).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to stop the Voting session', async function() {
                await expect(voting.connect(unknown).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });

        describe("tallyVotes()", function () {
            it('should forbid the owner to tally votes', async function() {
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
            })

            it('should set the right winningProposalID', async function() {
                await expect(voting.tallyVotes());
                let winningProposalID = await voting.winningProposalID();
                assert.equal(winningProposalID.toString(), '1');
            })

            it('should forbid a voter to tally votes', async function() {
                await expect(voting.connect(addr1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it('should forbid an unknown person to tally votes', async function() {
                await expect(voting.connect(unknown).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
            })
        });
    });

});
