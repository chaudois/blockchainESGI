$(document).ready(function() {
  	
  	var web3Provider = null;  	
  	var contracts = {};  	
  	var account = '0x0';

  	var candidatesNumber = 0;

	initContractLink();

	loadCandidates();

	loadToggleButton();


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

	

	function loadCandidates(){

		var blocVotingInstance;

		contracts.BlocVoting.deployed().then(function(instance) {

			blocVotingInstance = instance;
      		
      		return blocVotingInstance.getCandidatesNumber();

    	}).then(function(canNum) {

    		candidatesNumber = parseInt(canNum);
		
		    for (var i = 1; i <= candidatesNumber; i++) {
		   
		        blocVotingInstance.getCandidate(i).then(function(candidate) {
		        	
		        	var id = candidate[0];
		          
		          	var name = candidate[1];

		          	var party = candidate[2];

		          	var description = candidate[3];

		          	displayCandidate(id, name, party, description);
		        });
		    }


		}).catch(function(error) {

			console.warn(error);
		});
	}

	function displayCandidate(id, name, party, description){

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

				
			candidateCol += '</div>';

		candidateCol += '</div>';

		$("#candidateResume").append(candidateCol);
	}

	function loadToggleButton (){

		contracts.BlocVoting.deployed().then(function(instance) {

			blocVotingInstance = instance;
      		
      		return blocVotingInstance.isVoteRunning();

		}).then(function (voteIsRunning){
			if(voteIsRunning){
				$("#toggleVoteActivation").append("<div><p>votants : <button type='button' class='btn btn-danger' id='toggleVotes'>Stop Votes</button>");
				document.getElementById("toggleVotes").addEventListener("click", function(){
					blocVotingInstance.closeElection()
  					document.getElementById("toggleVoteActivation").innerHTML="<button type='button' class='btn btn-primary' id='toggleVotes'>Start Votes</button>"
				});


			}else{
				$("#toggleVoteActivation").append("<button type='button' class='btn btn-primary' id='toggleVotes'>Start Votes</button>");
				document.getElementById("toggleVotes").addEventListener("click", function(){
					blocVotingInstance.startElection()
  					document.getElementById("toggleVoteActivation").innerHTML="<button type='button' class='btn btn-danger' id='toggleVotes'>Stop Votes</button>"

				});

			}
		}).catch(function(error) {

			console.warn(error);
		});
	}
});