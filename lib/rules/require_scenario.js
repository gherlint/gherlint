const { isEmpty: _isEmpty, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class RequireScenario extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "require_scenario",
        message: "%s is missing a scenario",
        type: "error",
        location: {},
        hasFix: false,
    };

    constructor(ast, config) {
        super(ast, config);
        this.hasRule = false;
    }

    // Rule entry point
    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        return new RequireScenario(ast, config).execute();
    }

    execute() {
        this.hasScenario(this._ast.feature);

        return this.getProblems();
    }

    hasScenario(astObject) {
        let foundScenario = false;

        for (const child of astObject.children) {
            const keyword = _keys(child).shift();
            if (keyword === "rule") {
                this.hasRule = true;
                const ruleHasScenario = this.hasScenario(child[keyword]);
                if (!ruleHasScenario) {
                    this.addLintProblem(
                        child[keyword].keyword,
                        child[keyword].location
                    );
                }
            } else if (keyword === "scenario") {
                foundScenario = true;
                break;
            }
        }

        if (!this.hasRule && !foundScenario) {
            this.addLintProblem(astObject.keyword, astObject.location);
        }

        return foundScenario;
    }

    addLintProblem(keyword, location) {
        this.storeLintProblem({
            ...RequireScenario.meta,
            type: this._config.type,
            message: format(RequireScenario.meta.message, keyword),
            location,
        });
    }
};
