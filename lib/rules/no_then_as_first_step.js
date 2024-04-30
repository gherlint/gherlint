const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const Rule = require("./Rule");

module.exports = class NoThenAsFirstStep extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "no_then_as_first_step",
        message: "First step should not be a 'Then' step",
        type: "warn",
        location: {},
        hasFix: false,
    };

    constructor(ast, config) {
        super(ast, config);
    }

    // Rule entry point
    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        return new NoThenAsFirstStep(ast, config).execute();
    }

    execute() {
        this.checkFirstStep(this._ast);

        return this.getProblems();
    }

    checkFirstStep(astObject) {
        const keyword = _keys(astObject).shift();

        if (["background", "scenario"].includes(keyword)) {
            if (astObject[keyword].steps.length === 0) {
                return;
            }

            // get the first step
            const firstStep = astObject[keyword].steps[0];
            if (firstStep.keyword.trim() === "Then") {
                this.storeLintProblem({
                    ...NoThenAsFirstStep.meta,
                    type: this._config.type,
                    location: firstStep.location,
                });
            }
            return;
        }

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkFirstStep(child);
            }
        }
    }
};
