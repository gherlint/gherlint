const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class NoButInGivenWhen extends Rule {
    static meta = {
        ruleId: "no_but_in_given_when",
        message: "Do not use But in %s step",
        type: "warn",
        location: {},
        hasFix: false,
    };

    constructor(ast, config) {
        super(ast, config);
    }

    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        return new NoButInGivenWhen(ast, config).execute();
    }

    execute() {
        this.checkGivenOrWhenStep(this._ast);

        return this.getProblems();
    }

    checkGivenOrWhenStep(astObject) {
        const keyword = _keys(astObject).shift();

        if (["scenario", "background"].includes(keyword)) {
            const steps = astObject[keyword].steps;

            let givenWhenEncountered = false;
            let currentKeyword = "";

            for (const step of steps) {
                const { location } = step;
                if (step.keyword.trim() === "Given" || step.keyword.trim() === "When") {
                    givenWhenEncountered = true;
                    currentKeyword = step.keyword.trim();
                } else if (step.keyword.trim() === "Then") {
                    givenWhenEncountered = false;
                } else if (givenWhenEncountered && step.keyword.trim() === "But") {
                    this.storeLintProblem({
                        ...NoButInGivenWhen.meta,
                        type: this._config.type,
                        message: format(
                            NoButInGivenWhen.meta.message,
                            currentKeyword
                        ),
                        location,
                    });
                }
            }
        }

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkGivenOrWhenStep(child);
            }
        }
    }
};
