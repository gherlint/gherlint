const CLIOptions = require("./cliOptions");
const Linter = require("./linter");
const Config = require("./config");
const log = require("./logging/logger");
const LintLogger = require("./logging/lintLogger");

module.exports = {
    async execute(args) {
        const options = CLIOptions.parse(args);
        const config = new Config(options);

        // init config
        if (options.init) {
            return config.initConfig();
        }

        if (!options.files.length) {
            log.error(`Feature files not provided!`);
        }

        const configurations = config.getConfig();

        const linter = new Linter(options, configurations);
        if (options.isStdIn) {
            // TODO: lint from text content
            await linter.lintText();
        } else {
            await linter.lintFiles(options.files);
        }

        const lintMessages = linter.getLintMessages();
        LintLogger.log(lintMessages);

        return 0;
    },
};
