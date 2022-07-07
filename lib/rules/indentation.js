const { isEmpty } = require("lodash");
const { format } = require("util");
const Rule = require("./Rule");
const getIndentation = require("./defaults/indentation");

class Indentation extends Rule {
    /**
     * Rule filename and RuleId MUST follow snake_case convention
     */
    static meta = {
        ruleId: "indentation",
        message: "Expected indentation of %d but found %d",
        type: "warn",
        location: {},
        hasFix: true,
        // re-lint after a fix has been applied
        // - parse ast from updated text
        // - run linter again
        lintAfterFix: false,
        fixData: {},
        applyFix: () => {},
    };

    #hasRule = false;

    constructor(ast, config) {
        super(ast, config);
    }

    run() {
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

                return scenario.rule.children.forEach((scn) =>
                    this.#verifyScenario(scn)
                );
            }

            this.#verifyScenario(scenario);
        });
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
            this._problems.push({
                ...Indentation.meta,
                type: this._config.rules[Indentation.meta.ruleId][0],
                location,
                message: format(
                    Indentation.meta.message,
                    expectedIndent,
                    actualIndent
                ),
                fixData: {
                    replaceBy: " ".repeat(expectedIndent),
                    replaceTo: " ".repeat(actualIndent),
                },
                applyFix: this.applyFix,
            });
        }
    }

    applyFix(text, problem) {
        const updatedText = Rule.updateTextByLine(
            text,
            problem.fixData.replaceBy,
            problem.fixData.replaceTo,
            problem.location
        );
        return updatedText;
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

        // Tags - verify first tag occurance
        this.#verify({ keyword, location: tags[0].location });
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
}

module.exports = {
    run: function (ast, config) {
        if (isEmpty(ast.feature)) return;

        const rule = new Indentation(ast, config);

        // start rule check
        rule.run();

        return rule.getProblems();
    },
};
