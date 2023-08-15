const _ = require("lodash");

const CliOption = require("./CliOption");
const { GherLint, GherlintConfig } = require("../gherlint");
const { Logger } = require("../logging");

module.exports = class Cli {
    static async execute(args) {
        const cliOptions = CliOption.parse(args);
        const gherlintConfig = new GherlintConfig(cliOptions);

        // maybe determine in CliOption
        if (_.isEmpty(gherlintConfig.featureFiles)) {
            console.log("[ERROR] Missing path to feature file(s)");
            return 1;
        }

        // lint files
        const gherlint = new GherLint(gherlintConfig);
        const problems = gherlint.lintFiles();

        if (_.isEmpty(problems)) return 0;
        else {
            Logger.log(problems);
            return 1;
        }
    }
};
