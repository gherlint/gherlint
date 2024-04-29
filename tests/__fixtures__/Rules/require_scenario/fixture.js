const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const RequireScenario = require("../../../../lib/rules/require_scenario");

function generateProblem(location, keyword) {
    return generator(
        RequireScenario,
        location,
        format(RequireScenario.meta.message, keyword)
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
            "Multiple Rules",
            `Feature: a feature file
  Rule: rule 1
    Scenario: a scenario
  Rule: rule 2
    Scenario: a scenario`,
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
        [
            "Feature",
            "Feature: a feature file",
            [generateProblem({ line: 1, column: 1 }, "Feature")],
        ],
        [
            "Feature - Rule - Background",
            `Feature: a feature file
  Rule: a rule
    Background: a background`,
            [generateProblem({ line: 2, column: 3 }, "Rule")],
        ],
        [
            "Feature - Background",
            `Feature: a feature file
  Background: a background`,
            [generateProblem({ line: 1, column: 1 }, "Feature")],
        ],
        [
            "Multiple Rules",
            `Feature: a feature file
  Rule: rule 1
    Scenario: a scenario
  Rule: rule 2
    Background: a background
  Rule: rule 3
    Scenario: a scenario`,
            [generateProblem({ line: 4, column: 3 }, "Rule")],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
