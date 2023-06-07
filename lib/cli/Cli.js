const _ = require("lodash");

const CliOption = require("./CliOption");
const { GherLint } = require("../gherlint");
const { Logger } = require("../logging");

module.exports = class Cli {
    static async execute(args) {
        const options = CliOption.parse(args);

        // maybe determine in CliOption
        if (_.isEmpty(options.files)) {
            console.log("[ERROR] Missing path to feature file(s)");
            return 1;
        }

        // lint files
        const gherlint = new GherLint(options);
        const problems = gherlint.lintFiles(options.files);

        if (_.isEmpty(problems)) return 0;
        else {
            Logger.log(problems);
            return 1;
        }
    }
};
