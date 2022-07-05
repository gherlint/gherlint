const {
    Parser,
    GherkinClassicTokenMatcher,
    AstBuilder,
} = require("@cucumber/gherkin");
const cMessages = require("@cucumber/messages");
const { keys, isEmpty, has } = require("lodash");

const Rules = require("./rules");
const Fs = require("./Fs");
const { gherlintrc: defaultConfig } = require("./defaults");

module.exports = class Linter {
    constructor(config) {
        this.config = config || defaultConfig;
        this.problems = {};
        this.parser = new Parser(
            new AstBuilder(cMessages.IdGenerator.incrementing()),
            new GherkinClassicTokenMatcher()
        );
    }

    async lint(text, path) {
        const startTime = Date.now();
        const ast = this.parser.parse(text);

        // // Run rules
        keys(Rules).forEach((rule) => {
            // Only run rules that are not set to 'off'
            if (this.config.rules[rule][0] !== "off") {
                const lintProblems = Rules[rule].run(ast, this.config);
                if (!isEmpty(lintProblems)) {
                    this.problems[path] = this.problems[path] || {};
                    this.problems[path].problems =
                        this.problems[path].problems || [];

                    this.problems[path].problems = has(this.problems, path)
                        ? [...this.problems[path].problems, ...lintProblems]
                        : [...lintProblems];
                }
            }
        });
        this.problems[path].elapsedTime = `${Date.now() - startTime} ms`;
    }

    async lintFromFile(file) {
        const text = Fs.readFile(file);

        return this.lint(text, file);
    }

    getProblems() {
        return this.problems;
    }
};