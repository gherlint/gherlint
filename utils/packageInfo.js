const { resolve, join } = require("path");
const package = require(join(resolve(__dirname), "..", "package.json"));

module.exports = {
    getModuleName: () => package.name,
    getModuleVersion: () => package.version,
};
