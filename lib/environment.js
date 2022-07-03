const { name, version } = require("../package.json");

module.exports = {
    getModName: () => name,
    getModVersion: () => version,
};
