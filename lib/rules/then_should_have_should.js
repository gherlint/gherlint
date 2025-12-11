const Rule = require("./Rule");
const {isEmpty: _isEmpty} = require("lodash");

module.exports = class ThenShouldHaveShould extends Rule {
    static meta = {
        ruleId: "then_should_have_should",
        message: "Every Then step should contain the world 'should'",
        type: "error", // (warn | error | off)
        hasFix: false, // (true | false) - if the rule has a fixer or not
    };

    constructor(ast, config) {
        super(ast, config);
    }

    static async run(ast, config) {
        return await new ThenShouldHaveShould(ast, config).execute();
    }

    async execute() {
        if (_isEmpty(this._ast?.feature)) {
            return [];
        }

        for (const child of this._ast.feature.children) {
            let steps = [];
            if (child.scenario && child.scenario.steps) {
                steps = child.scenario.steps;
            } else if (child.background && child.background.steps) {
                steps = child.background.steps;
            }
            let inThen = false;
            for (const step of steps) {
                if (step.keywordType === "Outcome"){
                    inThen = true;
                } else if (step.keywordType !== "Conjunction"){
                    inThen = false;
                }

                if (inThen && step.text.search(/\sshould\s/) === -1) {
                    this.storeLintProblem({
                        ...ThenShouldHaveShould.meta,
                        type: this._config.type,
                        message: ThenShouldHaveShould.meta.message,
                        location: {
                            line: step.location.line,
                            column: step.location.column
                        },
                    });
                }
            }
        }

        return this.getProblems();
    }
};
