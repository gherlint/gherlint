const CliOptions = require("./CliOption");
const Linter = require("./linter");
const Config = require("./GherlintConfig");
const log = require("./logging/logger");
const LintLogger = require("./logging/lintLogger");
const { isEmpty } = require("lodash");

module.exports = class Cli {
    static exitCode = 0;

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

        const linter = new Linter(cliOptions, config.configuration);
        await linter.lintFiles(config.files);
        const lintMessages = linter.getLintMessages();

        if (isEmpty(lintMessages)) return Cli.exitCode;

        return LintLogger.log(lintMessages);
    }
};
