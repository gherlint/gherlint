const getIndentation = require("./defaults/indentation");
const hasRule = false;
const config = {};

function verify({ keyword, location }) {
    keyword = keyword.trim();

    if (location.column - 1 !== getIndentation(keyword, config, hasRule)) {
        console.error(
            `Incorrect indentation at line:${location.line} and column:${location.column}`
        );
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
    if (!tags.length) return;

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

            if (example.tableBody.length) {
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

module.exports = function ({ feature }, config) {
    const { keyword, tags, location, children } = feature;

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

            return scenario.rule.children.forEach((scn) => verifyScenario(scn));
        }

        verifyScenario(scenario);
    });
};
