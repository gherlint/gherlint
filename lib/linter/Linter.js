const {
    Parser,
    GherkinClassicTokenMatcher,
    AstBuilder,
} = require("@cucumber/gherkin");
const { IdGenerator } = require("@cucumber/messages");
const _ = require("lodash");

const { Rules } = require("../rules");

module.exports = class Linter {
    #startTime = 0;

    constructor(config) {
        this.config = config;
        this.astParser = new Parser(
            new AstBuilder(IdGenerator.incrementing()),
            new GherkinClassicTokenMatcher()
        );
    }

    lint(text) {
        this.startTimer();
        const lintProblems = {
            elapsedTime: null,
            problems: [],
        };

        const ast = this.parseAst(text);

        // Run rules
        _.forOwn(Rules, (rule, id) => {
            lintProblems.problems.push(
                ...rule.run(ast, this.getRuleConfig(id))
            );
        });

        lintProblems.elapsedTime = this.getElapsedTime();

        return lintProblems;
    }

    parseAst(text) {
        try {
            return this.astParser.parse(text);
        } catch (error) {
            console.log(error);
            throw new Error("Unable to parse Gherkin text");
        }
    }

    getRuleConfig(ruleId) {
        let rule = this.config.rules[ruleId];
        rule = typeof rule === "string" ? [rule] : rule;
        return {
            type: rule[0],
            option: [...rule.slice(1)],
        };
    }

    startTimer() {
        this.#startTime = Date.now();
    }

    getElapsedTime() {
        return Date.now() - this.#startTime;
    }
};
