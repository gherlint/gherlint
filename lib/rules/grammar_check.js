const Rule = require("./Rule");
const {isEmpty: _isEmpty, trimStart} = require("lodash");

module.exports = class GrammarCheck extends Rule {
    static meta = {
        ruleId: "grammar_check",
        message: "Grammar check failed",
        type: "warn", // (warn | error | off)
        hasFix: false, // (true | false) - if the rule has a fixer or not
    };

    constructor(ast, config) {
        super(ast, config);
    }

    static async run(ast, config) {
        return await new GrammarCheck(ast, config).execute();
    }

    async execute() {
        const harper = await import("harper.js");

        if (_isEmpty(this._ast?.feature)) {
            return [];
        }


        // We cannot use `WorkerLinter` on Node.js since it relies on web-specific APIs.
        const linter = new harper.LocalLinter({
            binary: harper.binary,
            dialect: harper.Dialect.British
        });
        if (this._config.option) {
            if (this._config.option.length > 0) {
                if (Object.values(harper.Dialect).includes(this._config.option[0])) {
                    await linter.setDialect(harper.Dialect[this._config.option[0]]);
                }
            }
            if (
                this._config.option.length > 1 &&
                this._config.option[1] &&
                this._config.option[1].length > 0
            ) {
                await linter.importWords(this._config.option[1]);
            }
            if (
                this._config.option.length > 2 &&
                this._config.option[2]
            ) {
                await linter.setLintConfig(this._config.option[2]);
            }
        }

        const lintOptions = {language: "plaintext"};
        let linesToCheck = [];
        linesToCheck.push(
            {
                text: this._ast.feature.keyword + ": " + this._ast.feature.name,
                lineOffset: this._ast.feature.location.line,
                columnOffset: 1,
            }
        );

        let lineNumber = 1;
        for (const line of this._ast.feature.description.split("\n")) {
            const trimmedLine = trimStart(line);
            const columnOffset = line.length - trimmedLine.length + 1;
            linesToCheck.push(
                {
                    text: trimmedLine,
                    lineOffset: this._ast.feature.location.line + lineNumber,
                    columnOffset: columnOffset,
                }
            );
            lineNumber++;
        }

        for (const comment of this._ast.comments) {
            const trimmedLine = trimStart(comment.text);
            const columnOffset = comment.text.length - trimmedLine.length + 1;
            linesToCheck.push(
                {
                    text: trimmedLine,
                    lineOffset: comment.location.line,
                    columnOffset: columnOffset,
                }
            );
        }

        for (const child of this._ast.feature.children) {
            let textToCheck = "";
            let lineOffset = 0;
            let columnOffset = 0;
            if (child.background && child.background.name) {
                textToCheck = child.background.keyword + ": " + child.background.name;
                lineOffset = child.background.location.line;
                columnOffset = child.background.location.column;
            }
            if (child.rule && child.rule.name) {
                textToCheck = child.rule.keyword + ": " + child.rule.name;
                lineOffset = child.rule.location.line;
                columnOffset = child.rule.location.column;
            }
            if (child.scenario && child.scenario.name) {
                textToCheck = child.scenario.keyword + ": " + child.scenario.name;
                lineOffset = child.scenario.location.line;
                columnOffset = child.scenario.location.column;
            }
            linesToCheck.push(
                {
                    text: textToCheck,
                    lineOffset: lineOffset,
                    columnOffset: columnOffset,
                }
            );
            let steps = [];
            if (child.scenario && child.scenario.steps) {
                steps = child.scenario.steps;
            } else if (child.background && child.background.steps) {
                steps = child.background.steps;
            }
            for (const step of steps) {
                linesToCheck.push(
                    {
                        text: step.keyword + step.text,
                        lineOffset: step.location.line,
                        columnOffset: step.location.column,
                    }
                );
                if (step.docString) {
                    let lineNumber = 1;
                    for (const line of step.docString.content.split("\n")) {
                        linesToCheck.push(
                            {
                                text: line,
                                lineOffset: step.docString.location.line + lineNumber,
                                columnOffset: step.docString.location.column,
                            }
                        );
                        lineNumber++;
                    }
                }
                if (step.dataTable && step.dataTable.rows.length > 0) {
                    for (const row of step.dataTable.rows) {
                        for (const cell of row.cells) {
                            linesToCheck.push(
                                {
                                    text: cell.value,
                                    lineOffset: cell.location.line,
                                    columnOffset: cell.location.column,
                                }
                            );
                        }
                    }
                }
            }
            if (child.scenario && child.scenario.examples.length > 0) {
                for (const example of child.scenario.examples) {
                    let cells = example.tableHeader.cells;
                    for (const row of example.tableBody) {
                        cells = [...cells, ...row.cells];
                    }
                    for (const cell of cells) {
                        linesToCheck.push(
                            {
                                text: cell.value,
                                lineOffset: cell.location.line,
                                columnOffset: cell.location.column,
                            }
                        );
                    }
                }
            }

        }

        for (const line of linesToCheck) {
            if (this._config.option && this._config.option.length > 3) {
                for (const replacement of this._config.option[3]) {
                    if (replacement[0] !== undefined && replacement[1] !== undefined ) {
                        line.text = line.text.replaceAll(replacement[0], replacement[1]);
                    }
                }
            }
            const harperLints = await linter.lint(line.text, lintOptions);
            const problems = this.compileLintProblems(
                harperLints, line.lineOffset, line.columnOffset
            );
            for (const problem of problems) {
                this.storeLintProblem(problem);
            }
        }

        return this.getProblems();
    }

    compileLintProblems(harperLints, lineOffset, columnOffset) {
        let problems = [];
        for (const lint of harperLints) {
            let message = lint.message();
            if (lint.suggestion_count() !== 0) {
                message += " Suggestions: ";
                let currentSuggestionCount = 1;
                for (const sug of lint.suggestions()) {
                    message +=
                        "\t - " +
                        sug.kind() === 1 ? "Remove" : "Replace with" + " '" +
                            sug.get_replacement_text() + "'";
                    if (lint.suggestion_count() > currentSuggestionCount) {
                        message += " OR ";
                    }
                    currentSuggestionCount++;
                }
            }
            problems.push({
                ...GrammarCheck.meta,
                type: this._config.type,
                message: message,
                location: {
                    line: lineOffset,
                    column: (columnOffset + lint.span().start) + "-" + (columnOffset + lint.span().end)
                },
            });
        }
        return problems;
    }
};
