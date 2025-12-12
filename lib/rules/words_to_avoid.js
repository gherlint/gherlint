const Rule = require("./Rule");
const {isEmpty: _isEmpty, isArray} = require("lodash");
const {format} = require("node:util");

module.exports = class WordsToAvoid extends Rule {
    static meta = {
        ruleId: "words_to_avoid",
        type: "error", // (warn | error | off)
        message: "Do not use the word '%s'.%s",
        hasFix: false, // (true | false) - if the rule has a fixer or not
    };

    constructor(ast, config) {
        super(ast, config);
    }

    static run(ast, config) {
        return new WordsToAvoid(ast, config).execute();
    }

    execute() {
        if (_isEmpty(this._ast?.feature)) {
            return [];
        }

        let wordsToAvoid = [];
        if (this._config.option && this._config.option.length > 0 && isArray(this._config.option)) {
            wordsToAvoid = this._config.option[0];
        }
        for (const word of wordsToAvoid) {
            const string = word[0];
            let error = "";
            if (word.length > 1) {
                error = " " + word[1];
            }
            for (const child of this._ast.feature.children) {
                let steps = [];
                if (child.scenario && child.scenario.steps) {
                    steps = child.scenario.steps;
                } else if (child.background && child.background.steps) {
                    steps = child.background.steps;
                }
                for (const step of steps) {
                    const searchRegex = new RegExp(`\\b${string}\\b`,"g");
                    let searchResult;

                    while ((searchResult = searchRegex.exec(step.text)) !== null) {
                        this.storeLintProblem({
                            ...WordsToAvoid.meta,
                            type: this._config.type,
                            message: format(WordsToAvoid.meta.message, string, error),
                            location: {
                                line: step.location.line,
                                column: step.location.column + step.keyword.length + searchResult.index
                                // the keyword already contains a space so `step.keyword.length` returns
                                // e.g. for Given => 6
                            },
                        });
                    }

                }
            }
        }

        // do some ordering, because we run first through the words and then lines
        let problems = this.getProblems();
        return problems.sort((a, b) => {
            const lineDiff = a.location.line - b.location.line;
            if (lineDiff !== 0) {
                return lineDiff;
            }
            return a.location.column - b.location.column;
        });
    }
};
