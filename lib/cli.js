const fs = require("fs");
const path = require("path");

const CLIOptions = require("./cliOptions");
const Linter = require("./linter");

module.exports = {
    async execute(args) {
        const options = {};
        // TODO: determine project root dir

        const featureFiles = [args[2]];

        const linter = new Linter();
        if (options.isStdIn) {
            await linter.lintText();
        } else {
            await linter.lintFiles(featureFiles);
        }
    },
};
