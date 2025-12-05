const _ = require("lodash");

const CliOption = require("./CliOption");
const { GherLint, GherlintConfig } = require("../gherlint");
const { Logger } = require("../logging");

module.exports = class Cli {
    static async execute(args) {
        const cliOptions = CliOption.parse(args);
        const gherlintConfig = new GherlintConfig(cliOptions);
        gherlintConfig.init();

        // maybe determine in CliOption
        if (_.isEmpty(gherlintConfig.featureFiles)) {
            console.log("[ERROR] Missing path to feature file(s)");
            return 1;
        }

        // lint files
        const gherlint = new GherLint(gherlintConfig);
        const problems = await gherlint.lintFiles();

        return Logger.log(problems);
    }
};
