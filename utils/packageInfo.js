const { resolve, join } = require("path");
const packageInfo = require(join(resolve(__dirname), "..", "package.json"));

module.exports = {
    getModuleName: () => packageInfo.name,
    getModuleVersion: () => packageInfo.version,
};
