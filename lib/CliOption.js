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

        const files = [];
        if (!isEmpty(program.args)) {
            program.args.forEach((arg) => {
                files.push(...Path.searchFiles(arg));
            });
        }

        // add 'files' as a new option
        program.addOption(new Option("files").default(files));

        return program.opts();
    }
};
