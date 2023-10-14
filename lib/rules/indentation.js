const { isEmpty } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");
const getIndentation = require("./defaults/indentation");

module.exports = class Indentation extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "indentation",
        message: "Expected indentation of %d but found %d",
        type: "error",
        location: {},
        hasFix: true,
        // re-lint after a fix has been applied
        // - parse ast from updated text
        // - run linter again
        lintAfterFix: false,
    };

    // Rule entry point
    static run(ast, config) {
        return new Indentation(ast, config).execute();
    }

    #hasRule = false;

    constructor(ast, config) {
        super(ast, config);
    }

    execute() {
        if (isEmpty(this._ast?.feature)) return [];

        const { keyword, tags, location, children } = this._ast.feature;

        // Feature
        this.#verify({ keyword, location });
        this.#verifyTags(tags, keyword);

        children.forEach((scenario) => {
            if (scenario.rule) {
                this.#hasRule = true;

                // Rule
                this.#verify({
                    keyword: scenario.rule.keyword,
                    location: scenario.rule.location,
                });

                // Rule tags
                this.#verifyTags(scenario.rule.tags, scenario.rule.keyword);

                return scenario.rule.children.forEach((scn) =>
                    this.#verifyScenario(scn)
                );
            }

            this.#verifyScenario(scenario);
        });

        return this.getProblems();
    }

    fixSingleLine(text, problem) {
        const lines = text.split("\n");
        // line number is 1 indexed
        const lineIndex = problem.location.line - 1;
        lines[lineIndex] =
            problem.fixData.indent + lines[lineIndex].trimStart();

        return lines.join("\n");
    }

    fixMultiLine(text, problem) {
        const lines = text.split("\n");
        // line number is 1 indexed
        const startLineIndex = problem.location.line - 1;
        const startLine = lines[startLineIndex].trim();
        lines[startLineIndex] = problem.fixData.indent + startLine;
        let endLineIndex = startLineIndex;

        for (const line of lines.slice(startLineIndex + 1)) {
            lines[++endLineIndex] = problem.fixData.indent + line;
            // eslint-disable-next-line quotes
            if (startLine.startsWith('"""') && line.trim().startsWith('"""')) {
                break;
            }
        }

        return lines.join("\n");
    }

    #getFixMethodForKeyword(keyword) {
        if (keyword === "DocString") {
            return this.fixMultiLine;
        }
        return this.fixSingleLine;
    }

    #verify({ keyword, location }) {
        keyword = keyword.trim();
        const expectedIndent = getIndentation(
            keyword,
            this._config,
            this.#hasRule
        );
        const actualIndent = location.column - 1;

        if (actualIndent !== expectedIndent) {
            this.storeLintProblem({
                ...Indentation.meta,
                type: this._config.type,
                location,
                message: format(
                    Indentation.meta.message,
                    expectedIndent,
                    actualIndent
                ),
                fixData: {
                    indent: " ".repeat(expectedIndent),
                },
                applyFix: this.#getFixMethodForKeyword(keyword),
            });
        }
    }

    #verifyScenario(scenario) {
        const { keyword, steps, location } =
            scenario.background || scenario.scenario;
        // Scenario: Background, Scenario & Scenario Outline
        this.#verify({ keyword, location });

        // check tag indention for scenarios
        if (!scenario.background) {
            this.#verifyTags(scenario.scenario.tags, keyword);
        }

        steps.forEach((step) => {
            this.#verifyStep(step);
        });

        if (keyword === "Scenario Outline") {
            this.#verifyExamples(scenario.scenario);
        }
    }

    #verifyTags(tags, keyword) {
        if (isEmpty(tags)) return;

        let previousTagLine = 0;
        tags.forEach((tag) => {
            if (tag.location.line !== previousTagLine) {
                this.#verify({ keyword, location: tag.location });
            }
            previousTagLine = tag.location.line;
        });
    }

    #verifyStep(step) {
        // Step keyword
        this.#verify({ keyword: step.keyword, location: step.location });

        if (step.docString) {
            // Step docString
            this.#verify({
                keyword: "DocString",
                location: step.docString.location,
            });
        }

        if (step.dataTable) {
            step.dataTable.rows.forEach((row) => {
                // Table row
                this.#verify({
                    keyword: "DataTable",
                    location: row.location,
                });
            });
        }
    }

    #verifyExamples(scenarioOutline) {
        const examples = scenarioOutline.examples || [];

        examples.forEach((example) => {
            // Examples
            this.#verify({
                keyword: example.keyword,
                location: example.location,
            });
            this.#verifyTags(example.tags, example.keyword);

            if (example.tableHeader) {
                // Table header
                this.#verify({
                    keyword: "ExampleTable",
                    location: example.tableHeader.location,
                });

                if (!isEmpty(example.tableBody)) {
                    example.tableBody.forEach((td) => {
                        // Table row
                        this.#verify({
                            keyword: "ExampleTable",
                            location: td.location,
                        });
                    });
                }
            }
        });
    }
};
