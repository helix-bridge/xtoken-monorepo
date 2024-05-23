var Configure = require("./configure/readconfig.js");
const privateKey = process.env.PRIKEY

function wallet(url) {
    const provider = new ethers.providers.JsonRpcProvider(url);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

async function registerNativeTokenOnIssuing(backingNetwork, issuingNetwork) {
    const walletIssuing = wallet(issuingNetwork.url);

    const issuing = await ethers.getContractAt("XTokenIssuing", issuingNetwork.xtoken[backingNetwork.name].issuingProxy, walletIssuing);
    const xwtoken = issuingNetwork.xtoken[backingNetwork.name].xwtoken;

    await issuing.updateXToken(
        backingNetwork.chainId,
        backingNetwork.wtoken,
        xwtoken,
        { gasLimit: 1000000 }
    );
    await issuing.setDailyLimit(
        xwtoken,
        "0x84595161401484a000000"
    );
    console.log("register native token on issuing finished");
}

async function registerNativeTokenOnBacking(backingNetwork, issuingNetwork) {
    const walletBacking = wallet(backingNetwork.url);

    const backing = await ethers.getContractAt("XTokenBacking", backingNetwork.xtoken[issuingNetwork.name].backingProxy, walletBacking);
    const xwtoken = issuingNetwork.xtoken[backingNetwork.name].xwtoken;
    await backing.registerOriginalToken(
        issuingNetwork.chainId,
        backingNetwork.wtoken,
        xwtoken,
        "0x84595161401484a000000"
    );
}

async function lockAndXIssueNative(backingNetwork, issuingNetwork) {
    const walletBacking = wallet(backingNetwork.url);

    const wtokenConvertor = await ethers.getContractAt("WTokenConvertor", backingNetwork.xtoken[issuingNetwork.name].wtokenConvertor, walletBacking);
    //ethers.utils.defaultAbiCoder.encode(['address', 'bytes'], [walletBacking.address, "0x"]),
    // xring -> ring
    //const extData = ethers.utils.defaultAbiCoder.encode(['address', 'bytes'], ["0xc29dCb1F12a1618262eF9FBA673b77140adc02D6", walletBacking.address]);
    //const extData = ethers.utils.defaultAbiCoder.encode(['address', 'bytes'], [walletBacking.address, '0x']);
    const extData = '0x';

    //const tx = await wtokenConvertor.callStatic.lockAndXIssue(
    const tx = await wtokenConvertor.lockAndXIssue(
        issuingNetwork.chainId,
        walletBacking.address,
        walletBacking.address,
        ethers.utils.parseEther("0.00001"),
        10001,
        extData,
        "0x000000000000000000000000000000000000000000000000000000000005f02200000000000000000000000088a39b052d477cfde47600a7c9950a441ce61cb400000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        { value: ethers.utils.parseEther("0.000011") }
    );
    console.log(tx);
}

async function burnAndXUnlockNative(backingNetwork, issuingNetwork) {
    const walletIssuing = wallet(issuingNetwork.url);

    const issuing = await ethers.getContractAt("XTokenIssuing", issuingNetwork.xtoken[backingNetwork.name].issuingProxy, walletIssuing);

    const xwtokenAddress = issuingNetwork.xtoken[backingNetwork.name].xwtoken;
    const xtoken = await ethers.getContractAt("Erc20", xwtokenAddress, walletIssuing);
    await xtoken.approve(issuing.address, ethers.utils.parseEther("10000000"), {gasLimit: 500000});

    const xtokenConvertor = backingNetwork.xtoken[issuingNetwork.name].wtokenConvertor;
    const extData = walletIssuing.address;
    console.log(xwtokenAddress, xtokenConvertor, extData);
    const tx = await issuing.callStatic.burnAndXUnlock(
    //await issuing.burnAndXUnlock(
        xwtokenAddress,
        xtokenConvertor, //recipient
        walletIssuing.address,
        ethers.utils.parseEther("0.0000001"),
        10001,
        extData,
        "0x000000000000000000000000000000000000000000000000000000000006493c00000000000000000000000088a39b052d477cfde47600a7c9950a441ce61cb400000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        {
            value: ethers.utils.parseEther("0.01"),
            gasLimit: 1000000,
        }
    );
    //console.log(tx);
}

async function main() {
    const env = 'dev';
    const backingChainName = 'sepolia';
    const issuingChainName = 'pangoro-tanssi';
    const messagerName = 'MsgportMessager';
    const version = 'v2.0';

    const configure = Configure.chain(env);
    const backingNetwork = configure[backingChainName];
    const issuingNetwork = configure[issuingChainName];

    //await registerNativeTokenOnIssuing(backingNetwork, issuingNetwork);
    //await registerNativeTokenOnBacking(backingNetwork, issuingNetwork);
    //await lockAndXIssueNative(backingNetwork, issuingNetwork);
    await burnAndXUnlockNative(backingNetwork, issuingNetwork);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
    
