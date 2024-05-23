const fs = require("fs");

var Configure = {
    chain: function(env) {
        const path = `script/configure/${env}.chain.json`;
        const chainInfo = JSON.parse(
            fs.readFileSync(path, "utf8")
        );
        return Object.fromEntries(
            chainInfo.map(e => [e.name, e])
        )
    },
    messager: function(env, chainName, messagerName, version) {
        const configure = Configure.chain(env);
        const messagers = configure[chainName].messager;
        const messagerMap = Object.fromEntries(
            messagers.map(e => [e.name + '-' + e.version, e])
        );
        return messagerMap[messagerName + '-' + version];
    }
}

module.exports = Configure
