const { isEmpty } = require("lodash");
const getIndentation = require("./defaults/indentation");
const { format } = require("util");

/**
 * Rule filename and RuleId MUST follow snake_case convention
 */
const ruleMeta = {
    ruleId: "indentation",
    message: "Expected indentation of %d but found %d",
};

let hasRule = false;
let lintConfig = null;
const lintMessages = [];

function verify({ keyword, location }) {
    keyword = keyword.trim();
    const expectedIndent = getIndentation(keyword, lintConfig, hasRule);
    const actualIndent = location.column - 1;

    if (actualIndent !== expectedIndent) {
        lintMessages.push({
            ...ruleMeta,
            type: lintConfig.rules[ruleMeta.ruleId][0],
            location,
            message: format(ruleMeta.message, expectedIndent, actualIndent),
        });
    }
}

function verifyScenario(scenario) {
    const { keyword, steps, location } =
        scenario.background || scenario.scenario;
    // Scenario: Background, Scenario & Scenario Outline
    verify({ keyword, location });

    // check tag indention for scenarios
    if (!scenario.background) {
        verifyTags(scenario.scenario.tags, keyword);
    }

    steps.forEach((step) => {
        verifyStep(step);
    });

    if (keyword === "Scenario Outline") {
        verifyExamples(scenario.scenario);
    }
}

function verifyTags(tags, keyword) {
    if (isEmpty(tags)) return;

    // Tags - verify first tag occurance
    verify({ keyword, location: tags[0].location });
}

function verifyStep(step) {
    // Step keyword
    verify({ keyword: step.keyword, location: step.location });

    if (step.docString) {
        // Step docString
        verify({ keyword: "DocString", location: step.docString.location });
    }

    if (step.dataTable) {
        step.dataTable.rows.forEach((row) => {
            // Table row
            verify({
                keyword: "DataTable",
                location: row.location,
            });
        });
    }
}

function verifyExamples(scenarioOutline) {
    const examples = scenarioOutline.examples || [];

    examples.forEach((example) => {
        // Examples
        verify({ keyword: example.keyword, location: example.location });
        verifyTags(example.tags, example.keyword);

        if (example.tableHeader) {
            // Table header
            verify({
                keyword: "ExampleTable",
                location: example.tableHeader.location,
            });

            if (!isEmpty(example.tableBody)) {
                example.tableBody.forEach((td) => {
                    // Table row
                    verify({
                        keyword: "ExampleTable",
                        location: td.location,
                    });
                });
            }
        }
    });
}

module.exports = {
    run: function (ast, config) {
        if (isEmpty(ast.feature)) return;
        lintConfig = config;

        const { keyword, tags, location, children } = ast.feature;

        // Feature
        verify({ keyword, location });
        verifyTags(tags, keyword);

        children.forEach((scenario) => {
            if (scenario.rule) {
                hasRule = true;

                // Rule
                verify({
                    keyword: scenario.rule.keyword,
                    location: scenario.rule.location,
                });

                return scenario.rule.children.forEach((scn) =>
                    verifyScenario(scn)
                );
            }

            verifyScenario(scenario);
        });

        return lintMessages;
    },
};
