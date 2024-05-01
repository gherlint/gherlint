const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const Rule = require("./Rule");

module.exports = class OnlyGivenStepInBackground extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "only_given_step_in_background",
        message: "Only use Given steps in Background",
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

        return new OnlyGivenStepInBackground(ast, config).execute();
    }

    execute() {
        this.checkBackgroundStep(this._ast);

        return this.getProblems();
    }

    checkBackgroundStep(astObject) {
        const keyword = _keys(astObject).shift();

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                const ckeyword = _keys(child).shift();
                if (ckeyword === "rule") {
                    this.checkBackgroundStep(child);
                    continue;
                }

                if (ckeyword !== "background") {
                    return;
                }

                if (child[ckeyword].steps.length === 0) {
                    return;
                }

                for (const step of child[ckeyword].steps) {
                    if (!["Given", "And"].includes(step.keyword.trim())) {
                        this.storeLintProblem({
                            ...OnlyGivenStepInBackground.meta,
                            type: this._config.type,
                            location: step.location,
                        });
                    }
                }
                return;
            }
        }
    }
};
