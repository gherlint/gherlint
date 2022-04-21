const Parser = require("../parser");
const Rules = require("../rules");
const { keys, isEmpty, has } = require("lodash");
const fs = require("fs");

module.exports = class Linter {
    constructor(cliOptions, config) {
        this.config = config;
        this.cliOptions = cliOptions;
        this.messages = {};
    }

    async lintFiles(files) {
        for (const file of files) {
            const ast = await Parser.parse(file);

            if (ast.error) {
                this.messages[ast.error.uri] = [
                    {
                        ruleId: "invalid_file",
                        type: "error",
                        location: ast.error.location,
                        message:
                            "Invalid feature file (a feature file MUST start with 'Feature' keyword)",
                    },
                ];
                continue;
            }

            // Run rules
            keys(Rules).forEach((rule) => {
                // Only run rules that are not set to 'off'
                if (this.config.rules[rule][0] !== "off") {
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

    fixLint() {
        for (const [filePath, messages] of Object.entries(this.messages)) {
            const messageList = [];
            messages.forEach(message => {
                if (message.ruleId === "indentation") {
                    messageList.push(message);
                }
            });
            if (messageList.length > 0) {
                const data = fs.readFileSync(filePath).toString().split("\n");
                messageList.forEach(message => {
                    const targetLineIndex = message.location.line - 1;
                    const targetLine = data[targetLineIndex];
                    const trimmedLine = targetLine.trim();
                    const spaces = " ".repeat(message.expectedIndentation);
                    data[targetLineIndex] = spaces + trimmedLine;
                    fs.writeFileSync(filePath, data.join("\n"));
                });
            }
        }
    }
};
