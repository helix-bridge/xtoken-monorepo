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
    const chainName = 'sepolia';
    const configure = Configure.chain(env);
    const network = configure[chainName];
    const w = wallet(network);

    const tokenContract = await ethers.getContractFactory("WToken", w);
    const token = await tokenContract.deploy("sepolia wrapped eth", "WETH", 18);
    await token.deployed();
    console.log(`finish to deploy wtoken contract, address is: ${token.address}`);
    return;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

