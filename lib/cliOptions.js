const { program, Option } = require("commander");
const { getModVersion, getModName } = require("./environment");
const { resolveFeatureFiles } = require("./path");
const log = require("./logging/logger");
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

module.exports = {
    parse(args) {
        program.parse(args);

        const files = [];
        if (!isEmpty(program.args)) {
            program.args.forEach((arg) => {
                files.push(...resolveFeatureFiles(arg));
            });

            if (isEmpty(files)) {
                log.error("Cannot find feature files!");
            }
        }
        program.addOption(new Option("files").default(files));

        return program.opts();
    },
};
