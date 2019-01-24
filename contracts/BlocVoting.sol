pragma solidity 0.5.0;
//TODO modifier le nom BockVoting, changer l'ordre des fonctions
contract BlocVoting {

    struct Candidate {

        uint id;

        string name;

        string party;

        string description;

        uint points;
    }
    bool VoteInProgress;

    mapping(address => bool) public votersAdresses;

    mapping(address => bool) public candidatesAdresses;

	uint public votersAmount;    

    mapping(uint => Candidate) public candidates;
    mapping(uint => Candidate) public electionResult;

    uint public candidatesNumber;
    uint public resultNumber;




    function runForElection(string memory _name, string memory _party, string memory _description) public {


        require(!candidatesAdresses[msg.sender]);
        require(VoteInProgress==false);

    	candidatesAdresses[msg.sender] = true;

        candidatesNumber ++;

        candidates[candidatesNumber] = Candidate(candidatesNumber, _name, _party, _description, 0);
    }

    function getCandidatesNumber() public view returns(uint) {

        return candidatesNumber;
    }
    function getResultNumber() public view returns(uint) {

        return resultNumber;
    }

    function getCandidate(uint candidateId) public view returns (uint, string memory, string memory, string memory) {
        
        return (candidateId, candidates[candidateId].name, candidates[candidateId].party, candidates[candidateId].description);
    }

    function vote (uint[] memory _voteArray) public {

        require(VoteInProgress==true);

        require(!votersAdresses[msg.sender]);

        uint voteArrayLength = _voteArray.length;

        require(voteArrayLength > 0 && voteArrayLength == candidatesNumber+1);

        votersAdresses[msg.sender] = true;

        votersAmount ++;

        for (uint candidateId=1; candidateId < voteArrayLength; candidateId++) {

        	uint candidatePoints = _voteArray[candidateId];
  			
			require(candidatePoints > 0 && candidatePoints <= candidatesNumber);

        	candidates[candidateId].points = candidates[candidateId].points + candidatePoints;
  		}
	}

	function getCandidatePoints(uint candidateId) public view returns(string memory, string memory, uint) {
    

        return (candidates[candidateId].name, candidates[candidateId].party, candidates[candidateId].points);
    }

    function getVotersAmount() public view returns(uint) {

        return votersAmount;
    }
    function isVoteRunning() public view returns(bool){
        return VoteInProgress;
    }

    function startElection()public payable {
        VoteInProgress=true;
    }
    function closeElection() public payable{
         for(uint i =0 ; i < candidatesNumber ; i++){
            electionResult[i]=candidates[i];
            delete(candidates[i]);
        }
        resultNumber=candidatesNumber;
        candidatesNumber=0;
        VoteInProgress=false;    
        votersAmount=0;
    }
    function getResult(uint candidateId) public view returns(uint, string memory, uint) {
        require(!VoteInProgress);
        return (candidateId,electionResult[candidateId].name,electionResult[candidateId].points);
    }
}