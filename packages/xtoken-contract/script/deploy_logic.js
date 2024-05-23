var Create2 = require("./api/create2.js");
var Configure = require("./configure/readconfig.js");

const privateKey = process.env.PRIKEY

async function deployxTokenBacking(wallet, deployerAddress, salt) {
    const bridgeContract = await ethers.getContractFactory("XTokenBacking", wallet);
    const bytecode = Create2.getDeployedBytecode(bridgeContract, [], []);
    const address = await Create2.deploy(deployerAddress, wallet, bytecode, salt);
    console.log("finish to deploy xToken backing logic, address: ", address);
    return address;
}

async function deployxTokenIssuing(wallet, deployerAddress, salt) {
    const bridgeContract = await ethers.getContractFactory("XTokenIssuing", wallet);
    const bytecode = Create2.getDeployedBytecode(bridgeContract, [], []);
    const address = await Create2.deploy(deployerAddress, wallet, bytecode, salt);
    console.log("finish to deploy xToken Issuing logic, address: ", address);
    return address;
}

function wallet(network) {
    const provider = new ethers.providers.JsonRpcProvider(network.url);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

// 2. deploy mapping token factory
async function main() {
    const configure = Configure.chain('dev');
    //const network = configure['pangoro-tanssi'];
    const network = configure['sepolia'];
    const w = wallet(network);
    
    const backingLogic = await deployxTokenBacking(w, network.deployer, "xTokenBacking-logic-v3.0.0");
    //const issuingLogic = await deployxTokenIssuing(w, network.deployer, "xTokenIssuing-logic-v3.0.0");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

