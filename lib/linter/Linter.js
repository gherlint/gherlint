const {
    Parser,
    GherkinClassicTokenMatcher,
    AstBuilder,
} = require("@cucumber/gherkin");
const { IdGenerator } = require("@cucumber/messages");
const { elapsedTime } = require("../../utils/time");

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

    async lint(text, isReLint = false) {
        this.startTimer();
        const lintProblems = {
            elapsedTime: null,
            problems: [],
        };

        let problems = [];

        try {
            problems = await this.runRules(text);
        } catch (error) {
            // push parser error as lint problem
            lintProblems.problems.push({
                ruleId: "parse-error",
                type: "error",
                message: "Invalid Gherkin syntax",
                location: error.location,
            });
        }

        // do not apply fix on re-lint
        if (this.config.fix && !isReLint) {
            const {problems: hardProblems, text: fixedText} = this.fixLint(
                text,
                problems
            );
            problems = hardProblems;
            lintProblems.text = fixedText;
        }
        lintProblems.problems.push(...problems);

        lintProblems.elapsedTime = elapsedTime(this.#startTime);

        return lintProblems;
    }

    async runRules(text) {
        const ast = this.parseAst(text);
        const problems = [];
        // Run rules
        for (const ruleId in Rules) {
            const config = this.getRuleConfig(ruleId);
            const rule = Rules[ruleId];
            // do not run rules that are set to 'off'
            if (config.type !== "off") {
                problems.push(...await rule.run(ast, config));
            }
        }
        return problems;
    }

    fixLint(text, problems) {
        const notFixableProblems = [];
        for (const problem of problems) {
            if (
                Object.prototype.hasOwnProperty.call(problem, "applyFix") &&
                problem.applyFix
            ) {
                text = problem.applyFix(text, problem);
                continue;
            }
            notFixableProblems.push(problem);
        }

        return { problems: notFixableProblems, text };
    }

    parseAst(text) {
        try {
            const ast = this.astParser.parse(text);

            // add the text to the ast
            // some rules might need it
            ast.text = text;

            return ast;
        } catch (error) {
            // throw first error
            throw error.errors[0];
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
};
