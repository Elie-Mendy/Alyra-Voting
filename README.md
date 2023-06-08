# Alyra Tests Unitaires avec HardHat

La démarche de test se veux quasi exhaustive via le parcour et la couverture en tests de chaque étape du workflow du systeme de vote.

* A chaque étape seront joué des séries de tests sur chacune des fonctions du contrat.

* Chaque série de test concernant une fonction, l'intéraction entre le contrat et les différents profils d'utilisateurs de la future application décentralisé qui pourrait lui etre associé: 
  * L'administrateur du vote (l'**owner** du smart contrat) 
  * un voter (une personne présente dans la whiteliste)
  * un personne exterieure à l'organisation  (une personne non whitelisté)

## Couverture des tests

# Installation et lancement
[Hardhat](https://github.com/nomiclabs/hardhat): compile and run the smart contracts on a local development network


[Ethers](https://github.com/ethers-io/ethers.js/): renowned Ethereum library and wallet implementation


## Utilisation

### Pré requis


```sh
yarn install
```

### Compilation

Compilation du smart contract avec hardhat

```sh
npx hardhat compile
```

### Test

Lancement des tests

```sh
npx hardhat test
```

#### Test coverage

Pour obtenir les informations concernant la vouverture des tests

```sh
npx hardhat coverage
```


## Remerciements

If you liked this project, follow me on github [github.com/Elie-Mendy](https://github.com/Elie-Mendy)

## License

MIT



# Rapport de test

## Coverage

```bash
-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |      100 |      100 |      100 |      100 |                |
  Voting.sol |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
All files    |      100 |      100 |      100 |      100 |                |
-------------|----------|----------|----------|----------|----------------|
```

## Gas Reporter

```bash

·------------------------------------------|----------------------------|-------------|-----------------------------·
|           Solc version: 0.8.20           ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
···········································|····························|·············|······························
|  Methods                                                                                                          │
·············|·····························|·············|··············|·············|···············|··············
|  Contract  ·  Method                     ·  Min        ·  Max         ·  Avg        ·  # calls      ·  usd (avg)  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  addProposal                ·      59237  ·      104153  ·      59447  ·          430  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  addVoter                   ·      50185  ·       50197  ·      50193  ·          575  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  endProposalsRegistering    ·          -  ·           -  ·      30587  ·          145  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  endVotingSession           ·          -  ·           -  ·      30521  ·           72  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  setVote                    ·      60885  ·       77985  ·      66906  ·          213  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  startProposalsRegistering  ·          -  ·           -  ·      95003  ·          182  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  startVotingSession         ·          -  ·           -  ·      30542  ·          111  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Voting    ·  tallyVotes                 ·          -  ·           -  ·      66431  ·           38  ·          -  │
·············|·····························|·············|··············|·············|···············|··············
|  Deployments                             ·                                          ·  % of limit   ·             │
···········································|·············|··············|·············|···············|··············
|  Voting                                  ·          -  ·           -  ·    2028930  ·        6.8 %  ·          -  │
·------------------------------------------|-------------|--------------|-------------|---------------|-------------·


```

## Test Log

```bash
Compiled 3 Solidity files successfully

  Test Voting
    Deployment
      ✓ should be deployed with the right owner
      ✓ should be deployed on status : RegisteringVoters
      ✓ should be deployed without any voter
      ✓ should be deployed without any proposal
      ✓ should be deployed without winningProposal
    Voters Registration
      addVoter()
        ✓ should allow the owner to register a voter
        ✓ should emit a VoterRegistered event when owner register a voter
        ✓ should forbid the owner to register a voter twice
        ✓ should forbid a voter to register a voter
        ✓ should forbid an unknown voter to register a voter
      getVoter()
        ✓ should forbid the owner to get a voter
        ✓ should forbid an unknown person to get a voter
        ✓ should allow a voter to get a voter
        ✓ should have not voted
        ✓ should indicate a non registered address as false
      addProposal()
        ✓ should forbid the owner to add a proposal
        ✓ should forbid a voter person to add a proposal
        ✓ should forbid an unknown person to add a proposal
      getOneProposal()
        ✓ should forbid the owner to get a proposal
        ✓ should forbid a voter to get a proposal
        ✓ should forbid an unknown person to get a proposal
      setVote()
        ✓ should forbid the owner to set a vote
        ✓ should forbid a voter to to set a vote
        ✓ should forbid an unknown person to set a vote
      startProposalsRegistering()
        ✓ should allow the owner to start the Proposal Registration session
        ✓ should emit a WorkflowStatusChange event when the owner start the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to start the Proposal Registration session
      endProposalsRegistering()
        ✓ should allow the owner to stop the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to stop the Proposal Registration session
      startVotingSession()
        ✓ should forbid the owner to start the Voting session
        ✓ should forbid a voter to start the Voting session
        ✓ should forbid an unknown person to start the Voting session
      endVotingSession()
        ✓ should allow the owner to stop the Voting session
        ✓ should forbid a voter to stop the Voting session
        ✓ should forbid an unknown person to stop the Voting session
      tallyVotes()
        ✓ should forbid the owner to tally votes
        ✓ should forbid a voter to tally votes
        ✓ should forbid an unknown person to tally votes
    Proposal Registration started
      workflowStatus
        ✓ should be on status : ProposalsRegistrationStarted
      Genesis proposal
        ✓ should created a genesis proposal
      addVoter()
        ✓ should forbid the owner to register a voter
        ✓ should forbid a voter to register a voter
        ✓ should forbid an unknown voter to register a voter
      getVoter()
        ✓ should forbid the owner to get a voter
        ✓ should forbid an unknown person to get a voter
        ✓ should allow a voter to get a voter
        ✓ should indicate a non registered address as false
      addProposal()
        ✓ should forbid the owner to add a proposal
        ✓ should allow a voter to add a proposal
        ✓ should emit a ProposalRegistered event when a proposal is submited
        ✓ should forbid a voter to add an empty proposal
        ✓ should forbid an unknown person to add a proposal
      getOneProposal()
        ✓ should forbid the owner to get a proposal
        ✓ should allow a voter to get a proposal
        ✓ should not return an unexisting proposal
        ✓ should forbid an unknown person to get a proposal
      setVote()
        ✓ should forbid the owner to set a vote
        ✓ should forbid a voter to to set a vote
        ✓ should forbid an unknown person to set a vote
      startProposalsRegistering()
        ✓ should forbid the owner to start the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to start the Proposal Registration session
      endProposalsRegistering()
        ✓ should allow the owner to stop the Proposal Registration session
        ✓ should emit a WorkflowStatusChange event when the owner start the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to stop the Proposal Registration session
      startVotingSession()
        ✓ should forbid the owner to start the Voting session
        ✓ should forbid a voter to start the Voting session
        ✓ should forbid an unknown person to start the Voting session
      endVotingSession()
        ✓ should allow the owner to stop the Voting session
        ✓ should forbid a voter to stop the Voting session
        ✓ should forbid an unknown person to stop the Voting session
      tallyVotes()
        ✓ should forbid the owner to tally votes
        ✓ should forbid a voter to tally votes
        ✓ should forbid an unknown person to tally votes
    Proposal Registration ended
      workflowStatus
        ✓ should be on status : ProposalsRegistrationEnded
      addVoter()
        ✓ should forbid the owner to register a voter
        ✓ should forbid a voter to register a voter
        ✓ should forbid an unknown voter to register a voter
      getVoter()
        ✓ should forbid the owner to get a voter
        ✓ should forbid an unknown person to get a voter
        ✓ should allow a voter to get a voter
        ✓ should indicate a non registered address as false
      addProposal()
        ✓ should forbid the owner to add a proposal
        ✓ should forbid a voter person to add a proposal
        ✓ should forbid an unknown person to add a proposal
      getOneProposal()
        ✓ should forbid the owner to get a proposal
        ✓ should allow a voter to get a proposal
        ✓ should not return an unexisting proposal
        ✓ should forbid an unknown person to get a proposal
      setVote()
        ✓ should forbid the owner to set a vote
        ✓ should forbid a voter to to set a vote
        ✓ should forbid an unknown person to set a vote
      startProposalsRegistering()
        ✓ should forbid the owner to start the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to start the Proposal Registration session
      endProposalsRegistering()
        ✓ should allow the owner to stop the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to stop the Proposal Registration session
      startVotingSession()
        ✓ should allow the owner to start the Voting session
        ✓ should emit a WorkflowStatusChange event when the owner start the Proposal Registration session
        ✓ should forbid a voter to start the Voting session
        ✓ should forbid an unknown person to start the Voting session
      endVotingSession()
        ✓ should allow the owner to stop the Voting session
        ✓ should forbid a voter to stop the Voting session
        ✓ should forbid an unknown person to stop the Voting session
      tallyVotes()
        ✓ should forbid the owner to tally votes
        ✓ should forbid a voter to tally votes
        ✓ should forbid an unknown person to tally votes
    Voting Session started
      workflowStatus
        ✓ should be on status : VotingSessionStarted
      addVoter()
        ✓ should forbid the owner to register a voter
        ✓ should forbid a voter to register a voter
        ✓ should forbid an unknown voter to register a voter
      addProposal()
        ✓ should forbid the owner to add a proposal
        ✓ should forbid a voter person to add a proposal
        ✓ should forbid an unknown person to add a proposal
      setVote()
        ✓ should forbid the owner to set a vote
        ✓ should allow a voter to set a vote
        ✓ should update the voter structure
        ✓ should emit a Voted event when a vote is submited
        ✓ should forbid a voter to set a vote twice
        ✓ should forbid a voter to set a vote twice
        ✓ should forbid an unknown person to set a vote
      getVoter()
        ✓ should forbid the owner to get a voter
        ✓ should forbid an unknown person to get a voter
        ✓ should allow a voter to get a voter
        ✓ should indicate a non registered address as false
      getOneProposal()
        ✓ should forbid the owner to get a proposal
        ✓ should allow a voter to get a proposal
        ✓ should return the correct voteCount
        ✓ should not return an unexisting proposal
        ✓ should forbid an unknown person to get a proposal
      startProposalsRegistering()
        ✓ should forbid the owner to start the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to start the Proposal Registration session
      endProposalsRegistering()
        ✓ should allow the owner to stop the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to stop the Proposal Registration session
      startVotingSession()
        ✓ should forbid the owner to start the Voting session
        ✓ should forbid a voter to start the Voting session
        ✓ should forbid an unknown person to start the Voting session
      endVotingSession()
        ✓ should allow the owner to stastoprt the Voting session
        ✓ should emit a WorkflowStatusChange event when the owner stop the Voting session
        ✓ should forbid a voter to stop the Voting session
        ✓ should forbid an unknown person to stop the Voting session
      tallyVotes()
        ✓ should forbid the owner to tally votes
        ✓ should forbid a voter to tally votes
        ✓ should forbid an unknown person to tally votes
    Voting Session Ended
      workflowStatus
        ✓ should be on status : VotingSessionStarted
      addVoter()
        ✓ should forbid the owner to register a voter
        ✓ should forbid a voter to register a voter
        ✓ should forbid an unknown voter to register a voter
      addProposal()
        ✓ should forbid the owner to add a proposal
        ✓ should forbid a voter person to add a proposal
        ✓ should forbid an unknown person to add a proposal
      addProposal()
        ✓ should forbid the owner to add a proposal
        ✓ should forbid a voter person to add a proposal
        ✓ should forbid an unknown person to add a proposal
      getOneProposal()
        ✓ should forbid the owner to get a proposal
        ✓ should allow a voter to get a proposal
        ✓ should return the correct voteCount
        ✓ should not return an unexisting proposal
        ✓ should forbid an unknown person to get a proposal
      setVote()
        ✓ should forbid the owner to set a vote
        ✓ should forbid a voter to to set a vote
        ✓ should forbid an unknown person to set a vote
      startProposalsRegistering()
        ✓ should forbid the owner to start the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to start the Proposal Registration session
      endProposalsRegistering()
        ✓ should allow the owner to stop the Proposal Registration session
        ✓ should forbid a voter to start the Proposal Registration session
        ✓ should forbid an unknown person to stop the Proposal Registration session
      startVotingSession()
        ✓ should forbid the owner to start the Voting session
        ✓ should forbid a voter to start the Voting session

  219 passing (20s)

```
