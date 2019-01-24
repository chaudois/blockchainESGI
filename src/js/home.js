$(document).ready(function() {
  	
  	var web3Provider = null;  	
  	var contracts = {};  	
  	var account = '0x0';

  	var candidatesNumber = 0;

	initContractLink();

	checkIfAlreadyVoted();

	loadCandidates();

	function initContractLink(){

		if (typeof web3 !== 'undefined') {
      
	    	web3Provider = web3.currentProvider;
	      
	      	web3 = new Web3(web3.currentProvider);
	    } 
	    else {
	      
	    	web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
	      
	    	web3 = new Web3(web3Provider);
	    }

	    $.ajax({
        	
        	type: 'GET',
        	url: 'BlocVoting.json',   
        	dataType: 'json',     
        
        	async: false,
        	
        	success: function(blocVoting) { 

        		contracts.BlocVoting = TruffleContract(blocVoting);
		      
		      	contracts.BlocVoting.setProvider(web3Provider);

		      	web3.eth.getCoinbase(function(err, act) {

			      	if (err === null) {
			        	
			        	account = act;
			      	}
		    	});
        	}
    	});
	}

	function checkIfAlreadyVoted(){

		contracts.BlocVoting.deployed().then(function(instance) {

			return instance.votersAdresses(account);

	    }).then(function(alreadyVoted) {

	    	if(alreadyVoted) {

	        	$("#voteBody").hide();
				$("#alreadyVotedBody").fadeIn();

				setTimeout(function(){ window.location.replace("resultView.html"); }, 7000);
	      	}

	    }).catch(function(error) {

	    	console.warn(error);
	    });
	}

	function loadCandidates(){

		var blocVotingInstance;
		contracts.BlocVoting.deployed().then(function(instance) {

			blocVotingInstance = instance;
      
      		return blocVotingInstance.isVoteRunning();
		}).then(function(isItTho){
			voteIsRunning=isItTho;
			return blocVotingInstance;
		}).then(function(instance){

      
      		return blocVotingInstance.getCandidatesNumber();

    	}).then(function(canNum) {

    		candidatesNumber = parseInt(canNum);
		
		    for (var i = 1; i <= candidatesNumber; i++) {
		   
		        blocVotingInstance.getCandidate(i).then(function(candidate) {
		        	
		        	var id = candidate[0];
		          
		          	var name = candidate[1];

		          	var party = candidate[2];

		          	var description = candidate[3];

		          	displayCandidate(id, name, party, description,voteIsRunning);
		        });
		    }

		}).catch(function(error) {

			console.warn(error);
		});
	}

	function displayCandidate(id, name, party, description,voteIsRunning){

		var candidateCol = '';

		candidateCol += '<div id="candidate'+id+'" class="col">';

			candidateCol += '<div class="card text-center text-white bg-secondary">';

				candidateCol += '<div class="card-header">';

					candidateCol += '<strong>'+ name +'</strong>';

				candidateCol += '</div>';

				candidateCol += '<div class="card-body">';

					candidateCol += '<h5 class="card-title">'

						candidateCol += party;

					candidateCol += '</h5>';

					candidateCol += '<p class="card-text">'

						candidateCol += description;

					candidateCol += '</p>';

				candidateCol += '</div>';

				if(voteIsRunning){

				candidateCol += '<div class="card-footer text-muted">';

					candidateCol += '<select id="candidate'+id+'Position" class="form-control">';

						candidateCol += '<option value="0" selected disabled>Use this menu to set this candidate position</option>';

						for (var j = 1; j <= candidatesNumber; j++) {
					
							candidateCol += '<option value="'+j+'">'+j+'</option>';
						}

					candidateCol += '</select>';

				candidateCol += '</div>';
				}

			candidateCol += '</div>';

		candidateCol += '</div>';

		$("#candidateList").append(candidateCol);
		if(!voteIsRunning){
			$("#buttonSendVote").hide();

		}

	}


	$("#buttonSendVote").click(function() {

		var voteValid = true;

		var addedPosition = [];

		for(var candidateId = 1; candidateId <= candidatesNumber; candidateId++) {
		
			if(voteValid){

				var candidatePosition = $("#candidate" + candidateId + "Position").val();

				if(candidatePosition == null || candidatePosition == "" || candidatePosition == 0){

					voteValid = false;
				}
				else{

					if(addedPosition.indexOf(candidatePosition) != -1){

						voteValid = false;
					}
					else{

						addedPosition.push(candidatePosition);						
					}
				}				
			}
		}

		if(voteValid){

			vote();
		}
		else{

			$("#voteErrorBody").fadeIn();
		}
	});
	
	$("#voteErrorBodyAlertButton").click(function() {
		
		$("#voteErrorBody").fadeOut();
	});

	function vote(){

		var voteArray = makeVoteArray();
		
		contracts.BlocVoting.deployed().then(function(instance) {

	    	return instance.vote(voteArray, { from: account });

		}).then(function(result) {		

			$("#voteBody").hide();
			$("#voteSuccessBody").fadeIn();

			setTimeout(function(){ window.location.replace("resultView.html"); }, 7000);
	      	
		}).catch(function(err) {

			console.error(err);
		});
	}

	function makeVoteArray(){

		var voteArray = [0];

		for(var candidateId = 1; candidateId <= candidatesNumber; candidateId++) {
		
			var candidatePosition = $("#candidate" + candidateId + "Position").val();

			var candidatePoints = (candidatesNumber + 1) - candidatePosition;

			voteArray[candidateId] = candidatePoints;
		}

		return voteArray;
	}
});