const CliOptions = require("./CliOption");
const Linter = require("./Linter");
const Config = require("./GherlintConfig");
const log = require("./logging/logger");
const LintLogger = require("./logging/lintLogger");
const { isEmpty } = require("lodash");

module.exports = class Cli {
    static async execute(args) {
        const cliOptions = CliOptions.parse(args);
        const config = new Config(cliOptions);

        // init config
        if (cliOptions.init) {
            return await config.initializeConfig();
        }

        if (isEmpty(config.files)) {
            log.error(
                "Missing path to feature file(s)!",
                "Usage:",
                "gherlint path/to/*.feature"
            );
        }

        const linter = new Linter(config.configuration);

        await Promise.all(
            config.files.map(async (file) => {
                linter.lintFromFile(file);
            })
        );

        const problems = linter.getProblems();

        if (isEmpty(problems)) return 0;
        else {
            console.log(problems);
            return 1;
        }
    }
};
