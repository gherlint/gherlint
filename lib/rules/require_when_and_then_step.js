const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class RequireWhenAndThenStep extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "require_when_and_then_step",
        message: "Missing %s step",
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

        return new RequireWhenAndThenStep(ast, config).execute();
    }

    execute() {
        this.checkWhenStep(this._ast);

        return this.getProblems();
    }
    
    checkWhenStep(astObject) {
        const keyword = _keys(astObject).shift();
        
        if (["scenario"].includes(keyword)) {
            const steps = astObject[keyword].steps;
            let whenEncountered = false;
            let thenEncountered = false;
            let givenLocation = {};
            let whenLocation = {};
            let thenLocation = {};
            const missingSteps = [];
            
            for (const step of steps) {
                const { location } = step;
                if (step.keyword.trim() === "Given") {
                    givenLocation = location;
                    
                }
                if (step.keyword.trim() === "When") {
                    whenEncountered = true;
                    whenLocation = location;
                } else if (step.keyword.trim() === "Then") {
                    thenEncountered = true;
                    thenLocation = location;
                }
            }

            let problemLocation = givenLocation;

            if (!whenEncountered) {
                missingSteps.push("When");
                problemLocation = thenEncountered ? thenLocation : givenLocation;
            }
            if (!thenEncountered) {
                missingSteps.push("Then");
                problemLocation = whenEncountered ? whenLocation : givenLocation;
            } 
            
            if (missingSteps.length) {
                this.storeLintProblem({
                    ...RequireWhenAndThenStep.meta,
                    type: this._config.type,
                    message: format(
                        RequireWhenAndThenStep.meta.message, missingSteps.join(" and ")
                    ),
                    location: problemLocation,
                });
            }
        }

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkWhenStep(child);
            }
        }
    }
};
