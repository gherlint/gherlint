const { name, version } = require("../package.json");

module.exports = {
    getCwd: () => process.cwd(),
    getModName: () => name,
    getModVersion: () => version,
};
