var Produto = artifacts.require("./Produto.sol");

module.exports = function (deployer) {
    deployer.deploy(Produto);
};
