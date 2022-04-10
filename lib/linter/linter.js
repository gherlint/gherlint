const Parser = require("../parser");
const Rules = require("../rules");

module.exports = class Linter {
    constructor(cliOptions, config) {
        this.config = config;
        this.cliOptions = cliOptions;
        this.messages = {};
    }

    async lintFiles(files) {
        for (const file of files) {
            const ast = await Parser.parse(file);

            // Run rules
            Object.keys(Rules).forEach((rule) => {
                // Only run rules that are not set to 'off'
                if (this.config.rules[rule] !== "off") {
                    const lintMessages = Rules[rule].run(ast, this.config);

                    this.messages[ast.path] = this.messages[ast.path]
                        ? this.messages[ast.path]
                        : [];
                    this.messages[ast.path] = [
                        ...this.messages[ast.path],
                        ...lintMessages,
                    ];
                }
            });
        }
    }

    getLintMessages() {
        return this.messages;
    }
};
