const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const Rule = require("./Rule");

module.exports = class LowercaseTitle extends Rule {
    static meta = {
        ruleId: "lowercase_title",
        message: "Use lowercase title",
        type: "off",
        location: {},
        hasFix: true,
    };

    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        return new LowercaseTitle(ast, config).execute();
    }

    execute() {
        this.checkTitle(this._ast);

        return this.getProblems();
    }

    checkTitle(astObject) {
        const keyword = _keys(astObject).shift();
        if (["rule", "feature", "background", "scenario"].includes(keyword)) {
            if (astObject[keyword].name.length !== 0) {
                if (
                    astObject[keyword].name !== astObject[keyword].name.toLowerCase()
                ) {
                    const location = { ...astObject[keyword].location };
                    location.column += astObject[keyword].keyword.length;
                    const problem = {
                        ...LowercaseTitle.meta,
                        type: this._config.type,
                        message: LowercaseTitle.meta.message,
                        location,
                        applyFix: LowercaseTitle.fixLowercaseTitle,
                    };
                    this.storeLintProblem(problem);
                }
            }
        }

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkTitle(child);
            }
        }
    }

    static fixLowercaseTitle(text, problem) {
        const lines = text.split("\n");
        const {
            location: { line, column },
        } = problem;

        const lineText = lines[line - 1];
        lines[line - 1] =
            lineText.substr(0, column - 1) +
            lineText.substr(column - 1).toLowerCase();

        return lines.join("\n");
    }
};
