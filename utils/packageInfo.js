const packageInfo = require("../package.json");

module.exports = {
    getModuleName: () => packageInfo.name,
    getModuleVersion: () => packageInfo.version,
};
