const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const Rule = require("./Rule");

module.exports = class RequireScenario extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "require_scenario",
        message: "A feature file must have a scenario",
        type: "error",
        location: {},
        hasFix: false,
    };

    // Rule entry point
    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        if (RequireScenario.hasScenario(ast)) return [];

        return [
            {
                ...RequireScenario.meta,
                type: config.type,
                location: { line: 1, column: 1 },
                message: RequireScenario.meta.message,
            },
        ];
    }

    static hasScenario(astObject) {
        const keyword = _keys(astObject).shift();

        if (keyword === "scenario") return true;

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                const foundScenario = RequireScenario.hasScenario(child);
                if (foundScenario) return foundScenario;
            }
        }
        return false;
    }
};
