const { program, Option } = require("commander");
const { getModVersion, getModName } = require("./environment");
const Path = require("./Path");
const { isEmpty } = require("lodash");

program
    .usage("[options] [<FILE|DIR|GLOB>...]")
    .option(
        "-c, --config <path::String>",
        "Use this configuration to specify .gherlintrc.* config"
    )
    .option("--init", "Generate default config file: .gherlintrc")
    .version(
        `${getModName()}: ${getModVersion()}`,
        "-v, --version",
        "Output the version number"
    )
    .showHelpAfterError();

module.exports = class CliOption {
    static parse(args) {
        program.parse(args);
        program.addOption(new Option("cliConfig").default({}));
        const options = program.opts();

        // arguments in the program are the paths-to-feature-file(s)
        if (!isEmpty(program.args)) options.cliConfig.files = program.args;

        return options;
    }
};
