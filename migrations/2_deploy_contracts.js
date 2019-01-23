var BlocVoting = artifacts.require("./BlocVoting.sol");

module.exports = function(deployer) {

	deployer.deploy(BlocVoting);
};
