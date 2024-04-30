var Create2 = require("./api/create2.js");
var Configure = require("./configure/readconfig.js");

const privateKey = process.env.PRIKEY

async function deployxTokenConvertor(wallet, deployerAddress, salt, wtoken, xtokenBacking) {
    const convertorContract = await ethers.getContractFactory("WTokenConvertor", wallet);
    const bytecode = Create2.getDeployedBytecode(convertorContract, ['address', 'address'], [wtoken, xtokenBacking]);
    const address = await Create2.deploy(deployerAddress, wallet, bytecode, salt);
    console.log("finish to deploy wtoken convertor, address: ", address);
    return address;
}

function wallet(network) {
    const provider = new ethers.providers.JsonRpcProvider(network.url);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

// 2. deploy mapping token factory
async function main() {
    const env = 'dev';
    const backingChainName = 'sepolia';
    const issuingChainName = 'pangoro-tanssi';
    const messagerName = 'MsgportMessager';
    const version = 'v2.0';


    const configure = Configure.chain(env);
    const backingNetwork = configure[backingChainName];
    const w = wallet(backingNetwork);

    const wtoken = backingNetwork.wtoken;
    const backingAddress = backingNetwork.xtoken[issuingChainName].backingProxy;

    const convertor = await deployxTokenConvertor(w, backingNetwork.deployer, `WToken-Convertor-v3.0.0-${issuingChainName}`, wtoken, backingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

