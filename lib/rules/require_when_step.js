const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class RequireWhenStep extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "require_when_step",
        message: "When is missing a step",
        type: "error",
        location: {},
        hasFix: false,
    };

    constructor(ast, config) {
        super(ast, config);
    }

    // Rule entry point
    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        return new RequireWhenStep(ast, config).execute();
    }

    execute() {
        this.checkWhenStep(this._ast);

        return this.getProblems();
    }

    checkWhenStep(astObject) {
        const keyword = _keys(astObject).shift();

        if (["background", "scenario"].includes(keyword)) {
            const steps = astObject[keyword].steps;
            let whenEncountered = false;
            
            for (const step of steps) {
                const { location } = step;
                if (step.keyword.trim() === "When") {
                    whenEncountered = true;
                } else if (!whenEncountered && step.keyword.trim() === "Then") {
                    this.storeLintProblem({
                        ...RequireWhenStep.meta,
                        type: this._config.type,
                        message: format(
                            RequireWhenStep.meta.message,
                        ),
                        location,
                    });
                }
            }
        }

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkWhenStep(child);
            }
        }
    }
};
