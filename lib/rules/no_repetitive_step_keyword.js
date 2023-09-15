const { isEmpty } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class NoRepetitiveSteps extends Rule {
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

    // Rule entry point
    static run(ast, config) {
        return new NoRepetitiveSteps(ast, config).execute();
    }

    constructor(ast, config) {
        super(ast, config);
    }

    execute() {
        if (isEmpty(this._ast?.feature)) return [];

        let { children } = this._ast.feature;

        // if feature has a rule, then scenarios will be in rule.children
        if (children[0].rule) {
            children = children[0].rule.children;
        }

        children.forEach((scenario) => {
            const { steps } = scenario.background || scenario.scenario;
            this.#checkRepetition(steps);
        });

        return this.getProblems();
    }

    #checkRepetition(steps) {
        let currentStep = null;
        steps.forEach((step) => {
            const { keyword } = step;
            if (currentStep === keyword) {
                const { location } = step;
                const problem = {
                    ...NoRepetitiveSteps.meta,
                    type: this._config.type,
                    location,
                    message: format(
                        NoRepetitiveSteps.meta.message,
                        keyword.trim()
                    ),
                };
                this.storeLintProblem(problem);
            }
            // 'And' and '*' can be used repeatedly
            if (keyword.trim() === "And" || keyword.trim() === "*") return;
            currentStep = keyword;
        });
    }
};
