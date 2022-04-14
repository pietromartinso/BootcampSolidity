const FundMe = artifacts.require("FundMe");

module.exports = function (deployer) {
  deployer.deploy(FundMe);
};
