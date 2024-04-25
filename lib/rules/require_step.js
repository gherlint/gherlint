const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class RequireStep extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "require_step",
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

        return new RequireStep(ast, config).execute();
    }

    execute() {
        this.checkStep(this._ast);

        return this.getProblems();
    }

    checkStep(astObject) {
        const keyword = _keys(astObject).shift();

        if (["background", "scenario"].includes(keyword)) {
            if (astObject[keyword].steps.length === 0) {
                this.storeLintProblem({
                    ...RequireStep.meta,
                    type: this._config.type,
                    message: format(
                        RequireStep.meta.message,
                        astObject[keyword].keyword
                    ),
                    location: astObject[keyword].location,
                });
            }
        }

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkStep(child);
            }
        }
    }
};
