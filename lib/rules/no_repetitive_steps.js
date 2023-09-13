const { isEmpty } = require("lodash");
const Rule = require("./Rule");

module.exports = class NoRepetitiveSteps extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "no_repetitive_steps",
        message: "Repetitive steps '%s'",
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

        const { children } = this._ast.feature;

        children.forEach((scenario) => {
            const { steps } = scenario.background || scenario.scenario;
            this.#isRepeated(steps);
        });

        return [];
    }

    #isRepeated(steps) {
        let currentStep = null;
        steps.forEach((step) => {
            const { keyword } = step;
            if (currentStep === keyword) {
                // TODO: add problem
                console.log(step);
            }
            currentStep = keyword;
        });
    }
};
