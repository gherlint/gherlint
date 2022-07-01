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

        const configurations = config.getConfig();

        if (isEmpty(configurations.files)) {
            log.error(
                "Missing path to feature file(s)!",
                "Usage:",
                "gherlint path/to/*.feature"
            );
        }

        const linter = new Linter(cliOptions, configurations);
        await linter.lintFiles(configurations.files);
        const lintMessages = linter.getLintMessages();

        if (isEmpty(lintMessages)) return Cli.exitCode;

        return LintLogger.log(lintMessages);
    }
};
