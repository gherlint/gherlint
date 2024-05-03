const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class LowercaseDescription extends Rule {
    static meta = {
        ruleId: "lowercase_description",
        message: "Expected lowercase description on keyword '%s'",
        type: "off",
        location: {},
        hasFix: true,
        // lintAfterFix: false,
    };

    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        return new LowercaseDescription(ast, config).execute();
    }

    execute() {
        this.checkDescription(this._ast);

        return this.getProblems();
    }

    checkDescription(astObject) {
        const keyword = _keys(astObject).shift();
        if (["rule", "feature", "background", "scenario"].includes(keyword)) {
            if (
                typeof astObject[keyword].name === "string" &&
                astObject[keyword].name.length !== 0
            ) {
                if (
                    astObject[keyword].name[0] ===
                    astObject[keyword].name[0].toUpperCase()
                ) {
                    const location = this.countKeywordDescriptionLine(
                        this._ast,
                        astObject[keyword].name
                    );
                    const problem = {
                        ...LowercaseDescription.meta,
                        type: this._config.type,
                        message: format(
                            LowercaseDescription.meta.message,
                            astObject[keyword].keyword
                        ),
                        location,
                        applyFix: LowercaseDescription.fixLowercaseDescription,
                    };
                    this.storeLintProblem(problem);
                }
            }
        }

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkDescription(child);
            }
        }
    }

    countKeywordDescriptionLine(ast, keywordDescription) {
        let lineIndex = 0;
        let descriptionLocation = {};
        for (const line of ast.text.split("\n")) {
            lineIndex++;
            const match = line.match(new RegExp("\\b" + keywordDescription));
            if (match !== null) {
                descriptionLocation = {
                    line: lineIndex,
                    column: match.index + 1,
                };
                break;
            }
        }
        return descriptionLocation;
    }

    static fixLowercaseDescription(text, problem) {
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
