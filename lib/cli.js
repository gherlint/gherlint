const fs = require("fs");
const path = require("path");
const CLIOptions = require("./cliOptions");
const Linter = require("./linter");
const { getCwd } = require("./environment");
const { gherlintrc } = require("../defaults");

module.exports = {
    async execute(args) {
        const options = CLIOptions.parse(args);

        // init config
        if (options.init) {
            console.info("Initializing config file...");
            return fs.writeFile(
                path.join(getCwd(), ".gherlintrc"),
                JSON.stringify(gherlintrc, null, 4),
                (err) => {
                    if (err) throw err;
                    console.info("Finished!");
                }
            );
        }

        const featureFiles = options.files;

        const linter = new Linter(options);
        if (options.isStdIn) {
            await linter.lintText();
        } else {
            await linter.lintFiles(featureFiles);
        }
    },
};
