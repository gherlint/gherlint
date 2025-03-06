const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class RequireWhenAndThenStep extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "require_when_and_then_step",
        message: "%s is missing a step",
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

        return new RequireWhenAndThenStep(ast, config).execute();
    }

    execute() {
        this.checkWhenStep(this._ast);

        return this.getProblems();
    }
    
    checkWhenStep(astObject) {
        const keyword = _keys(astObject).shift();
        const lastLineNumber = this.getLastStepLocation(this._ast)
        
        if (["scenario"].includes(keyword)) {
            // console.log("this._ast:",this._ast)
            // console.log("lastLineNumber:",lastLineNumber)
            const steps = astObject[keyword].steps;
            let whenEncountered = false;
            let thenEncountered = false;
            let lastLineLocation = {}
            let thenLocation = {}
            const missingSteps = [];
            
            for (const step of steps) {
                const { location } = step
                lastLineLocation = {line: lastLineNumber+1, column: location.column}
                if (step.keyword.trim() === "When") {
                    whenEncountered = true;
                }
                else if (step.keyword.trim() === "Then") {
                    thenEncountered = true;
                    thenLocation = location;
                }
            }

            let problemLocation = lastLineLocation;

            if (!whenEncountered) {
                missingSteps.push("When");
                problemLocation = thenEncountered ? thenLocation : lastLineLocation;
            }
            else if (!thenEncountered) {
                missingSteps.push("Then");
            
                if (whenEncountered) {
                    // Find the last "When" step's location
                    const whenLocation = steps.find(step => step.keyword.trim() === "When")?.location || lastLineLocation;
            
                    // Move problemLocation to the next meaningful line
                    problemLocation = { line: whenLocation.line + 1, column: whenLocation.column };
                } else {
                    problemLocation = lastLineLocation;
                }
            }
            else {
                problemLocation = lastLineLocation;
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

    getLastStepLocation(ast) {
        if (!ast?.text) return 0
        const lines = ast.text.split("\n");
        let lastLineNumber = lines.length;
    
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim() !== "") {
                lastLineNumber = i + 1;
                break;
            }
        }
        return lastLineNumber;
    }
};
