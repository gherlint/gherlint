const CLIOptions = require("./cliOptions");
const Linter = require("./linter");

module.exports = {
    async execute(args) {
        const options = CLIOptions.parse(args.slice(2));

        const featureFiles = options.files;

        const linter = new Linter(options);
        if (options.isStdIn) {
            await linter.lintText();
        } else {
            await linter.lintFiles(featureFiles);
        }
    },
};
