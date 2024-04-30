var Configure = require("./configure/readconfig.js");
const privateKey = process.env.PRIKEY

function wallet(url) {
    const provider = new ethers.providers.JsonRpcProvider(url);
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet;
}

async function connectMessager(env, backingChainName, issuingChainName, messagerName, version) {
    const configure = Configure.chain(env);
    const backingNetwork = configure[backingChainName];
    const issuingNetwork = configure[issuingChainName];

    const walletBacking = wallet(backingNetwork.url);
    const walletIssuing = wallet(issuingNetwork.url);

    const backingMessagerInfo = Configure.messager(env, backingChainName, messagerName, version);
    const issuingMessagerInfo = Configure.messager(env, issuingChainName, messagerName, version);

    const backingMessager = await ethers.getContractAt(messagerName, backingMessagerInfo.address, walletBacking);
    const issuingMessager = await ethers.getContractAt(messagerName, issuingMessagerInfo.address, walletIssuing);
    await backingMessager.setRemoteMessager(issuingNetwork.chainId, issuingMessagerInfo.id, issuingMessager.address, {gasLimit: 2000000});
    await issuingMessager.setRemoteMessager(backingNetwork.chainId, backingMessagerInfo.id, backingMessager.address, {gasLimit: 2000000});
}

async function authorize(env, backingChainName, issuingChainName, messagerName, version) {
    const configure = Configure.chain(env);
    const backingNetwork = configure[backingChainName];
    const issuingNetwork = configure[issuingChainName];

    const walletBacking = wallet(backingNetwork.url);
    const walletIssuing = wallet(issuingNetwork.url);

    const backingMessagerInfo = Configure.messager(env, backingChainName, messagerName, version);
    const issuingMessagerInfo = Configure.messager(env, issuingChainName, messagerName, version);

    const backingAddress = backingNetwork.xtoken[issuingChainName].backingProxy;
    const issuingAddress = issuingNetwork.xtoken[backingChainName].issuingProxy;

    const backingMessager = await ethers.getContractAt(messagerName, backingMessagerInfo.address, walletBacking);
    const issuingMessager = await ethers.getContractAt(messagerName, issuingMessagerInfo.address, walletIssuing);
    
    await backingMessager.setWhiteList(backingAddress, true, {gasLimit: 2000000});
    await issuingMessager.setWhiteList(issuingAddress, true, {gasLimit: 2000000});
    console.log("messager authorize xtoken bridge successed");
}

async function setService(env, backingChainName, issuingChainName, messagerName, version) {
    const configure = Configure.chain(env);
    const backingNetwork = configure[backingChainName];
    const issuingNetwork = configure[issuingChainName];

    const walletBacking = wallet(backingNetwork.url);
    const walletIssuing = wallet(issuingNetwork.url);

    const backingMessagerInfo = Configure.messager(env, backingChainName, messagerName, version);
    const issuingMessagerInfo = Configure.messager(env, issuingChainName, messagerName, version);

    const backingAddress = backingNetwork.xtoken[issuingChainName].backingProxy;
    const issuingAddress = issuingNetwork.xtoken[backingChainName].issuingProxy;

    const backing = await ethers.getContractAt('XTokenBacking', backingAddress, walletBacking);
    const issuing = await ethers.getContractAt('XTokenIssuing', issuingAddress, walletIssuing);
    
    await backing.setSendService(issuingNetwork.chainId, issuing.address, backingMessagerInfo.address, {gasLimit: 2000000});
    await backing.setReceiveService(issuingNetwork.chainId, issuing.address, backingMessagerInfo.address, {gasLimit: 2000000});
    await issuing.setSendService(backingNetwork.chainId, backing.address, issuingMessagerInfo.address, {gasLimit: 2000000});
    await issuing.setReceiveService(backingNetwork.chainId, backing.address, issuingMessagerInfo.address, {gasLimit: 2000000});
    console.log("xtoken bridge connect remote successed");
}

async function main() {
    const env = 'dev';
    const backingChainName = 'sepolia';
    const issuingChainName = 'pangoro-tanssi';
    const messagerName = 'MsgportMessager';
    const version = 'v2.0';

    //await connectMessager(env, backingChainName, issuingChainName, messagerName, version);
    //await authorize(env, backingChainName, issuingChainName, messagerName, version);
    await setService(env, backingChainName, issuingChainName, messagerName, version);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
    
