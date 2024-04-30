var Configure = require("./configure/readconfig.js");
const privateKey = process.env.PRIKEY

function wallet(url) {
    const provider = new ethers.providers.JsonRpcProvider(url);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

// 2. deploy mapping token factory
async function main() {
    const env = 'dev';
    const chainName = 'pangoro-tanssi';
    const backingChainName = 'sepolia';
    const configure = Configure.chain(env);
    const network = configure[chainName];
    const w = wallet(network);

    const tokenContract = await ethers.getContractFactory("Erc20", w);
    const token = await tokenContract.deploy("mapped sepolia wrapped eth", "xETH", 18);
    await token.deployed();
    await token.transferOwnership(network.xtoken[backingChainName].issuingProxy);
    console.log(`finish to deploy xtoken contract, address is: ${token.address}`);
    return;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

