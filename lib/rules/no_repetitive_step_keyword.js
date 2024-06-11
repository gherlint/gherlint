const { isEmpty } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class NoRepetitiveStepKeyword extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "no_repetitive_step_keyword",
        message: "Repetitive step keyword '%s'",
        type: "error",
        location: {},
        hasFix: true,
        // re-lint after a fix has been applied
        // - parse ast from updated text
        // - run linter again
        lintAfterFix: false,
    };

    static repeatableKeywords = ["And", "*"];
    static inconsecutiveRepeatableKeywords = ["But"];

    // Rule entry point
    static run(ast, config) {
        return new NoRepetitiveStepKeyword(ast, config).execute();
    }

    constructor(ast, config) {
        super(ast, config);
    }

    execute() {
        if (isEmpty(this._ast?.feature)) return [];

        let { children } = this._ast.feature;

        // if feature has a rule, then scenarios will be in rule.children
        if (children.length && children[0].rule) {
            children = children[0].rule.children;
        }

        children.forEach((scenario) => {
            const { steps } = scenario.background || scenario.scenario;
            this.#checkRepetition(steps);
        });

        return this.getProblems();
    }

    fixRepetition(text, problem) {
        const lines = text.split("\n");
        const {
            location: { line },
            fixData: { keyword },
        } = problem;

        const lineText = lines[line - 1];
        lines[line - 1] = lineText.replace(keyword, "And");

        return lines.join("\n");
    }

    #checkRepetition(steps) {
        let currentStep = null;
        steps.forEach((step) => {
            let { keyword } = step;
            keyword = keyword.trim();
            if (currentStep === keyword) {
                const { location } = step;
                const problem = {
                    ...NoRepetitiveStepKeyword.meta,
                    type: this._config.type,
                    location,
                    message: format(
                        NoRepetitiveStepKeyword.meta.message,
                        keyword
                    ),
                    fixData: {
                        keyword,
                    },
                    applyFix: this.fixRepetition,
                };
                this.storeLintProblem(problem);
            }
            // 'And' and '*' can be used repeatedly
            if (NoRepetitiveStepKeyword.repeatableKeywords.includes(keyword)) {
                if (
                    NoRepetitiveStepKeyword.inconsecutiveRepeatableKeywords.includes(
                        currentStep
                    )
                ) {
                    currentStep = null;
                }
                return;
            }
            currentStep = keyword;
        });
    }
};
