const Parser = require("../parser");
const Rules = require("../rules");

module.exports = class Linter {
    constructor(cliOptions, config) {
        this.config = config;
        this.cliOptions = cliOptions;
    }

    async lintFiles(files) {
        for (const file of files) {
            const ast = await Parser.parse(file);

            // Run rules
            Object.keys(Rules).forEach((rule) => {
                // Only run rules that are not set to 'off'
                if (this.config.rules[rule] !== "off") {
                    Rules[rule].run(ast);
                }
            });
        }
    }

    async lintText(text) {}
};
