const {
    Parser,
    GherkinClassicTokenMatcher,
    AstBuilder,
} = require("@cucumber/gherkin");
const { IdGenerator } = require("@cucumber/messages");
const { keys, isEmpty, has } = require("lodash");

const Rules = require("./rules");
const Fs = require("./Fs");
const { gherlintrc: defaultConfig } = require("./defaults");

module.exports = class Linter {
    #text;
    #path;
    #ast;

    constructor(config) {
        this.config = config || defaultConfig;
        this.problems = {};
        this.parser = new Parser(
            new AstBuilder(IdGenerator.incrementing()),
            new GherkinClassicTokenMatcher()
        );
    }

    async lint(text, path) {
        this.#text = text;
        this.#path = path;

        const startTime = Date.now();

        this.#ast = this.parseAst(this.#text);

        // Run rules
        keys(Rules).forEach((rule) => {
            // Only run rules that are not set to 'off'
            if (this.config.rules[rule][0] !== "off") {
                const lintProblems = this.runRule(Rules[rule]);
                if (!isEmpty(lintProblems)) {
                    this.problems[this.#path] = this.problems[this.#path] || {};
                    this.problems[this.#path].problems =
                        this.problems[this.#path].problems || [];

                    if (has(this.problems, this.#path)) {
                        this.problems[this.#path].problems = [
                            ...this.problems[this.#path].problems,
                            ...lintProblems,
                        ];
                    } else {
                        this.problems[this.#path].problems = [...lintProblems];
                    }
                }
            }
        });

        // if there are problems, set execution time
        if (!isEmpty(this.problems[this.#path])) {
            this.problems[this.#path].elapsedTime = `${
                Date.now() - startTime
            } ms`;
        }

        // write fixed text to file
        if (this.config.cliOptions.fix) {
            Fs.writeFile(this.#path, this.#text);
        }
    }

    runRule(rule) {
        const problems = rule.run(this.#ast, this.config);

        if (this.config.cliOptions.fix) {
            return this.fix(rule, problems);
        }
        return problems;
    }

    fix(rule, problems) {
        const unFixableProblems = [];
        for (const problem of problems) {
            if (problem.hasFix) {
                this.#text = problem.applyFix(this.#text, problem);

                // run rule again with updated text
                if (problem.lintAfterFix) {
                    // update ast
                    this.#ast = this.parseAst(this.#text);
                    // re-run rule
                    unFixableProblems.push(...this.runRule(rule));
                    break;
                }
            } else {
                unFixableProblems.push(problem);
            }
        }
        return unFixableProblems;
    }

    parseAst(text) {
        return this.parser.parse(text);
    }

    async lintFromFile(file) {
        const text = Fs.readFile(file);

        return this.lint(text, file);
    }

    getProblems() {
        return this.problems;
    }
};
