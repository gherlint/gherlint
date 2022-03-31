const getIndentation = require("./defaults/indentation");
const hasRule = false;

function verify({ keyword, location }, config) {
    keyword = keyword.trim();

    if (location.column - 1 !== getIndentation(keyword, config, hasRule)) {
        console.error(
            `Incorrect indentation at line:${location.line} and column:${location.column}`
        );
    }
}

function verifyScenario(scenario, config) {
    const { keyword, steps, location } =
        scenario.background || scenario.scenario;
    // Scenario: Background, Scenario & Scenario Outline
    verify({ keyword, location }, config);

    steps.forEach((step) => {
        verifyStep(step, config);
    });

    if (keyword === "Scenario Outline") {
        verifyExamples(scenario.scenario, config);
    }
}

function verifyStep(step, config) {
    // Step keyword
    verify({ keyword: step.keyword, location: step.location }, config);

    if (step.docString) {
        // Step docString
        verify(
            { keyword: "DocString", location: step.docString.location },
            config
        );
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

function verifyExamples(scenarioOutline, config) {
    const examples = scenarioOutline.examples || [];

    examples.forEach((example) => {
        // Examples
        verify({ keyword: example.keyword, location: example.location });

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
    const { keyword, location, children } = feature;

    // Feature
    verify({ keyword, location }, config);

    children.forEach((scenario) => {
        if (scenario.rule) {
            hasRule = true;

            // Rule
            verify(
                {
                    keyword: scenario.rule.keyword,
                    location: scenario.rule.location,
                },
                config
            );

            return scenario.rule.children.forEach((scn) =>
                verifyScenario(scn, config)
            );
        }

        verifyScenario(scenario, config);
    });
};
