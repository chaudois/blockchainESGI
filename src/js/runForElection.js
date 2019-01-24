$(document).ready(function() {

	var web3Provider = null;
  	var contracts = {};
  	var account = '0x0';

	initContractLink();

	checkIfAlreadyCandidate();

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

	function checkIfAlreadyCandidate(){
		contracts.BlocVoting.deployed().then(function(instance) {
			

			return instance.isVoteRunning();

	    }).then(function(isItTho) {
	    	voteRuning = isItTho;
	    });
		contracts.BlocVoting.deployed().then(function(instance) {


			return instance.candidatesAdresses(account);

	    }).then(function(alreadyCandidate) {

    		if( voteRuning){
    			$("#runForElectionBody").hide();
				$("#votesNotRuning").fadeIn();

				setTimeout(function(){ window.location.replace("index.html"); }, 7000);
    		}
	    	if(alreadyCandidate ) {

	        	$("#runForElectionBody").hide();
				$("#alreadyCandidateBody").fadeIn();

				setTimeout(function(){ window.location.replace("index.html"); }, 7000);
	      	}

	    }).catch(function(error) {

	    	console.warn(error);
	    });
	}

	$("#buttonRunForElection").click(function(e) {

		e.preventDefault();
		
		var formValid = true;

		var name = $("#name").val();

		if(name==""||name==null){

			$("#name").removeClass("is-valid");
			$("#name").addClass("is-invalid");

			formValid = false;
		}
		else{

			$("#name").addClass("is-valid");
			$("#name").removeClass("is-invalid");
		}
		
		var party = $("#party").val();

		if(party==""||party==null){

			$("#party").removeClass("is-valid");
			$("#party").addClass("is-invalid");

			formValid = false;
		}
		else{

			$("#party").addClass("is-valid");
			$("#party").removeClass("is-invalid");
		}
		
		var description = $("#descriptionTextarea").val();

		if(formValid){

			runForElection(name, party, description);
		}
		else{

			$("#formErrorBody").fadeIn();
		}
	});
	
	$("#formErrorBodyAlertButton").click(function() {
		
		$("#formErrorBody").fadeOut();
	});

	function runForElection(name, party, description){

		contracts.BlocVoting.deployed().then(function(instance) {

			return instance.runForElection(name, party, description, { from: account });
		
		}).then(function(result) {		

			$("#runForElectionBody").hide();
			$("#runForElectionSuccessBody").fadeIn();

			setTimeout(function(){ window.location.replace("index.html"); }, 7000);

		}).catch(function(err) {
      		
      		console.error(err);
    	});
	}
});