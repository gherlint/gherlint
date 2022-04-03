const { program, Option } = require("commander");
const { getModVersion, getModName } = require("./environment");
const { resolveFeatureFiles } = require("./path");

program
    .usage("[options] [<FILE|DIR|GLOB>...]")
    .option(
        "-c, --config [path::String]",
        "Use this configuration to specify .gherlintrc.* config"
    )
    .version(
        `${getModName()}: ${getModVersion()}`,
        "-v, --version",
        "Output the version number"
    )
    .showHelpAfterError();

module.exports = {
    parse(args) {
        program.parse();

        const files = [];
        if (program.args.length > 0) {
            program.args.forEach((arg) => {
                files.push(...resolveFeatureFiles(arg));
            });
        }

        if (!files.length) {
            throw "Feature files not found!";
        }

        program.addOption(new Option("files").default(files));

        return program.opts();
    },
};
