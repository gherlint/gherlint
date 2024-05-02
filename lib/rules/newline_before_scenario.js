const { isEmpty: _isEmpty, has: _has, keys: _keys } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");

module.exports = class NewlineBeforeScenario extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "newline_before_scenario",
        message: "Expected %s newline(s) before Scenario but found %s",
        type: "off",
        location: {},
        hasFix: true,
    };

    static defaultNewline = 1;

    #comments = [];
    #lastLine = 0;

    constructor(ast, config) {
        super(ast, config);

        if (!this._config.option.length) {
            this._config.option.push(NewlineBeforeScenario.defaultNewline);
        }
    }

    // Rule entry point
    static run(ast, config) {
        if (_isEmpty(ast?.feature)) return [];

        return new NewlineBeforeScenario(ast, config).execute();
    }

    execute() {
        this.#comments = this._ast.comments;
        this.checkNewlines(this._ast);

        return this.getProblems();
    }

    checkNewlines(astObject) {
        const keyword = _keys(astObject).shift();

        if (["background", "scenario"].includes(keyword)) {
            // NOTE: the order of code execution matters
            if (keyword === "scenario") {
                // -1 to exclude the last one
                let lineDiff =
                    astObject[keyword].location.line - this.#lastLine - 1;

                const commentsCount = this.getCommentCountBetweenLines(
                    this.#lastLine,
                    astObject[keyword].location.line
                );
                lineDiff =
                    lineDiff -
                    this.getTagLine(astObject[keyword].tags) -
                    commentsCount;

                if (lineDiff !== this._config.option[0]) {
                    this.storeLintProblem({
                        ...NewlineBeforeScenario.meta,
                        type: this._config.type,
                        message: format(
                            NewlineBeforeScenario.meta.message,
                            this._config.option[0],
                            lineDiff
                        ),
                        location: astObject[keyword].location,
                    });
                }
            }

            this.#lastLine = astObject[keyword].location.line;
            this.countKeywordDescriptionLine(astObject[keyword].description);
            this.countStepLine(astObject[keyword].steps);

            if (keyword === "scenario") {
                this.countExampleLine(astObject[keyword].examples);
            }

            return;
        }

        this.#lastLine = astObject[keyword].location.line;
        this.countKeywordDescriptionLine(astObject[keyword].description);

        if (_has(astObject[keyword], "children")) {
            for (const child of astObject[keyword].children) {
                this.checkNewlines(child);
            }
        }
    }

    getTagLine(tags) {
        let tagLineCount = 0;
        if (tags.length) {
            let currentTagLine = 0;
            for (const tag of tags) {
                if (tag.location.line !== currentTagLine) {
                    currentTagLine = tag.location.line;
                    tagLineCount++;
                }
            }
        }
        return tagLineCount;
    }

    countKeywordDescriptionLine(description) {
        if (description.trim()) {
            this.#lastLine += description.split("\n").length;
        }
    }

    countStepLine(steps) {
        if (steps.length) {
            const lastStep = steps[steps.length - 1];
            this.#lastLine = lastStep.location.line;

            if (lastStep.dataTable) {
                const rows = lastStep.dataTable.rows;
                const lastRow = rows[rows.length - 1];
                this.#lastLine = lastRow.location.line;
            }
            if (lastStep.docString) {
                // +1 for the last delimiter
                this.#lastLine =
                    lastStep.docString.location.line +
                    lastStep.docString.content.split("\n").length +
                    1;
            }
        }
    }

    countExampleLine(examples) {
        if (examples.length) {
            const lastExample = examples[examples.length - 1];
            const lastBody =
                lastExample.tableBody[lastExample.tableBody.length - 1];
            this.#lastLine = lastBody.location.line;
        }
    }

    // start and end are exclusive
    getCommentCountBetweenLines(start, end) {
        let commentsCount = 0;
        for (const comment of this.#comments) {
            if (comment.location.line < start) {
                continue;
            }
            if (comment.location.line > end) {
                break;
            }
            commentsCount++;
        }
        return commentsCount;
    }
};
