const CLIOptions = require("./cliOptions");
const Linter = require("./linter");
const Config = require("./config");
const log = require("./logging/logger");
const LintLogger = require("./logging/lintLogger");
const { isEmpty } = require("lodash");

module.exports = {
    async execute(args) {
        const options = CLIOptions.parse(args);
        const config = new Config(options);

        // init config
        if (options.init) {
            return config.initConfig();
        }

        if (isEmpty(options.files)) {
            log.error(
                "Missing path to feature file(s)!",
                "Usage:",
                "gherlint path/to/*.feature"
            );
        }

        const configurations = config.getConfig();

        const linter = new Linter(options, configurations);
        await linter.lintFiles(options.files);
        const lintMessages = linter.getLintMessages();

        if (isEmpty(lintMessages)) return 0;

        return LintLogger.log(lintMessages);
    },
};
