const CliOptions = require("./CliOption");
const Linter = require("./linter");
const Config = require("./config");
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
            return config.initConfig();
        }

        if (isEmpty(cliOptions.files)) {
            log.error(
                "Missing path to feature file(s)!",
                "Usage:",
                "gherlint path/to/*.feature"
            );
        }

        const configurations = config.getConfig();

        const linter = new Linter(cliOptions, configurations);
        await linter.lintFiles(cliOptions.files);
        const lintMessages = linter.getLintMessages();

        if (isEmpty(lintMessages)) return Cli.exitCode;

        return LintLogger.log(lintMessages);
    }
};
