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
        if (this._config.option && this._config.option.length > 0) {
            if (Object.values(harper.Dialect).includes(this._config.option[0])) {
                await linter.setDialect(harper.Dialect[this._config.option[0]]);
            }
        }
        if (
            this._config.option &&
            this._config.option.length > 1 &&
            this._config.option[1] &&
            this._config.option[1].length > 0
        ) {
            await linter.importWords(this._config.option[1]);
        }
        const lintOptions = {language: "plaintext"};

        let harperLints = await linter.lint(this._ast.feature.keyword + ": " + this._ast.feature.name, lintOptions);
        let problems = this.compileLintProblems(
            harperLints, this._ast.feature.location.line, 1
        );

        let lineNumber = 1;
        for (const line of this._ast.feature.description.split("\n")) {
            const trimmedLine = trimStart(line);
            const columnOffset = line.length - trimmedLine.length + 1;
            harperLints = await linter.lint(trimmedLine, lintOptions);
            problems = [
                ...problems,
                ...this.compileLintProblems(
                    harperLints, this._ast.feature.location.line + lineNumber, columnOffset
                )
            ];
            lineNumber++;
        }

        for (const comment of this._ast.comments) {
            const trimmedLine = trimStart(comment.text);
            const columnOffset = comment.text.length - trimmedLine.length + 1;
            harperLints = await linter.lint(trimmedLine, lintOptions);
            problems = [
                ...problems,
                ...this.compileLintProblems(
                    harperLints, comment.location.line, columnOffset
                )
            ];
        }

        for (const child of this._ast.feature.children) {
            let textToCheck="";
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
            harperLints = await linter.lint(textToCheck, lintOptions);
            problems = [
                ...problems,
                ...this.compileLintProblems(
                    harperLints, lineOffset, columnOffset
                )
            ];
            let steps = [];
            if (child.scenario && child.scenario.steps) {
                steps = child.scenario.steps;
            } else if (child.background && child.background.steps) {
                steps = child.background.steps;
            }
            for (const step of steps) {
                harperLints = await linter.lint(step.keyword + step.text, lintOptions);
                problems = [
                    ...problems,
                    ...this.compileLintProblems(
                        harperLints, step.location.line, step.location.column
                    )
                ];
                if (step.docString) {
                    let lineNumber = 1;
                    for (const line of step.docString.content.split("\n")) {
                        harperLints = await linter.lint(line, lintOptions);
                        problems = [
                            ...problems,
                            ...this.compileLintProblems(
                                harperLints, step.docString.location.line + lineNumber, step.docString.location.column
                            )
                        ];
                        lineNumber++;
                    }
                }
                if (step.dataTable && step.dataTable.rows.length > 0) {
                    for (const row of step.dataTable.rows) {
                        for (const cell of row.cells) {
                            harperLints = await linter.lint(cell.value, lintOptions);
                            problems = [
                                ...problems,
                                ...this.compileLintProblems(
                                    harperLints, cell.location.line, cell.location.column
                                )
                            ];
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
                        harperLints = await linter.lint(cell.value, lintOptions);
                        problems = [
                            ...problems,
                            ...this.compileLintProblems(
                                harperLints, cell.location.line, cell.location.column
                            )
                        ];
                    }
                }
            }

        }

        for (const problem of problems) {
            this.storeLintProblem(problem);
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
