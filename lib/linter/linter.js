const Parser = require("../parser");
const Rules = require("../rules");
const { keys, isEmpty, has } = require("lodash");

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
            keys(Rules).forEach((rule) => {
                // Only run rules that are not set to 'off'
                if (this.config.rules[rule] !== "off") {
                    const lintMessages = Rules[rule].run(ast, this.config);
                    if (!isEmpty(lintMessages)) {
                        if (has(this.messages, ast.path)) {
                            this.messages[ast.path] = [
                                ...this.messages[ast.path],
                                ...lintMessages,
                            ];
                        } else {
                            this.messages[ast.path] = [...lintMessages];
                        }
                    }
                }
            });
        }
    }

    getLintMessages() {
        return this.messages;
    }
};
