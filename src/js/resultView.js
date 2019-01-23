$(document).ready(function() {

	var web3Provider = null;
  	var contracts = {};
  	var account = '0x0';

  	var candidatesNumber = 0;

	initContractLink();

	checkIfAlreadyVoted();

	loadCandidatesResult();

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

	    	if(!alreadyVoted) {

	        	$("#resultViewBody").hide();
				$("#notVotedBody").fadeIn();

				setTimeout(function(){ window.location.replace("index.html"); }, 7000);
	      	}

	    }).catch(function(error) {

	    	console.warn(error);
	    });
	}

	function loadCandidatesResult(){

		var blocVotingInstance;

		contracts.BlocVoting.deployed().then(function(instance) {

			blocVotingInstance = instance;
      
      		return blocVotingInstance.getCandidatesNumber();

    	}).then(function(canNum) {

    		candidatesNumber = parseInt(canNum);

    		var candidateList = [];
		
		    for (var i = 1; i <= candidatesNumber; i++) {
		   
		        blocVotingInstance.getCandidatePoints(i).then(function(candidate) {
		        	
		        	var name = candidate[0];
		        	var party = candidate[1];
		        	var points = parseInt(candidate[2]);

					var candidateResult = {name:name, party:party, points:points};

					candidateList.push(candidateResult);

					return candidateList;

		        }).then(function(candidateList) {

		        	if(candidateList.length == candidatesNumber){

			        	candidateList.sort(sortByPoints);

			    		displayCandidateList(candidateList);

			    		blocVotingInstance.getVotersAmount().then(function(votersAmount) {
		        	
				        	$("#votersAmount").html(parseInt(votersAmount));

				        }).catch(function(error) {

							console.warn(error);
						});
		    		}
		        });
		    }

		}).catch(function(error) {

			console.warn(error);
		});
	}

	function sortByPoints(candidate1, candidate2){
  		
  		var candidate1Points = parseInt(candidate1.points);
  		
  		var candidate2Points = parseInt(candidate2.points);
  		
  		return ((candidate2Points < candidate1Points) ? -1 : ((candidate2Points > candidate1Points) ? 1 : 0));
	}

	function displayCandidateList(candidateList){

		for(key in candidateList){
		
			var position = parseInt(key) + 1;
			
			var candidate = candidateList[key];
			
			var newLi = '';
			
			if(position == 1){
			
				newLi = '<tr class="bg-success">';
			}
			
			else{
				
				newLi = '<tr>';
			}
				
					newLi += '<th scope="row">'+ position +'</th>';
			
					newLi += '<td>'+ candidate.name +'</td>';

					newLi += '<td>'+ candidate.party +'</td>';
				
					newLi += '<td>'+ candidate.points +'</td>';
			
			newLi += '</tr>';
				
			$("#candidateList").append(newLi);
		}
	}
});