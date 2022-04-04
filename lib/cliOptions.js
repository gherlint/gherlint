const { program, Option } = require("commander");
const { getModVersion, getModName } = require("./environment");
const { resolveFeatureFiles } = require("./path");

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
        if (program.args.length > 0) {
            program.args.forEach((arg) => {
                files.push(...resolveFeatureFiles(arg));
            });

            if (!files.length) {
                console.error(
                    "No feature files found using patterns: " +
                        program.args.join(", ")
                );
            }
        }
        program.addOption(new Option("files").default(files));

        return program.opts();
    },
};
