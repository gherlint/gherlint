const generator = require("../../../helpers/problemGenerator");
const RequireScenario = require("../../../../lib/rules/require_scenario");

function generateProblem() {
    return generator(
        RequireScenario,
        { line: 1, column: 1 },
        RequireScenario.meta.message
    );
}

function getValidTestData() {
    return [
        [
            "Rule - Background - Scenario",
            `Feature: a feature file
  Rule: a rule
    Background: a background
    Scenario: a scenario`,
            [],
        ],
        [
            "Rule - Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario`,
            [],
        ],
        [
            "Rule - Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: a scenario`,
            [],
        ],
        [
            "Background - Scenario",
            `Feature: a feature file
  Background: a background
  Scenario: a scenario`,
            [],
        ],
        [
            "Background - Scenario Outline",
            `Feature: a feature file
  Background: a background
  Scenario Outline: a scenario`,
            [],
        ],
    ];
}

function getInvalidTestData() {
    return [
        ["Feature", "Feature: a feature file", [generateProblem()]],
        [
            "Feature - Rule - Background",
            `Feature: a feature file
  Rule: a rule
    Background: a background`,
            [generateProblem()],
        ],
        [
            "Feature - Background",
            `Feature: a feature file
  Background: a background`,
            [generateProblem()],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
