var ProxyDeployer = require("./api/proxy.js");
var Configure = require("./configure/readconfig.js");

const privateKey = process.env.PRIKEY

function wallet(network) {
    const provider = new ethers.providers.JsonRpcProvider(network.url);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

async function deployxTokenProxy(wallet, salt, dao, proxyAdminAddress, logicAddress, deployer) {
    const bridgeContract = await ethers.getContractFactory("XTokenBridgeBase", wallet);
    const proxy = await ProxyDeployer.deployProxyContract2(
        deployer,
        salt,
        proxyAdminAddress,
        bridgeContract,
        logicAddress,
        [dao, salt],
        wallet,
        5000000
    );
    console.log("finish to deploy xtoken bridge proxy, address:", proxy);
    return proxy;
}

async function deploy() {
    const env = 'dev';
    //const chainName = 'sepolia';
    //const targetChain = 'pangoro-tanssi';
    //const contractType = 'backing';

    const chainName = 'pangoro-tanssi';
    const targetChain = 'sepolia';
    const contractType = 'issuing';

    const configure = Configure.chain(env);
    const network = configure[chainName];
    const w = wallet(network);
    const logicAddress = network.xtoken[targetChain][`${contractType}Logic`];

    await deployxTokenProxy(w, `xtoken-${contractType}-3.0.0-${targetChain}`, network.dao, network.proxyAdmin, logicAddress, network.deployer);
}

async function main() {
    await deploy();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
    
