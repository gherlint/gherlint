const generator = require("../../../helpers/problemGenerator");
const OnlyGivenStepInBackground = require("../../../../lib/rules/only_given_step_in_background");

function generateProblem(location) {
    return generator(
        OnlyGivenStepInBackground,
        location,
        OnlyGivenStepInBackground.meta.message
    );
}

function getValidTestData() {
    return [
        [
            "with Rule: Background",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step`,
            [],
        ],
        [
            "with Rule: Background - Scenario",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
      Given a step
    Scenario: a scenario
      When a step`,
            [],
        ],
        [
            "with Rule: multiple Rules",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
    Scenario: a scenario
      Given a step
      When a step
  Rule: a rule
    Background: a background
      Given a step`,
            [],
        ],
        [
            "with Rule: no scenarios",
            `Feature: a feature file
  Rule: a rule`,
            [],
        ],
        [
            "with Rule: only scenarios",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario
      Given a step
      When a step`,
            [],
        ],
        [
            "without Rule: Background",
            `Feature: a feature file
  Background: a background
    Given a step`,
            [],
        ],
        [
            "without Rule: Background - Scenario",
            `Feature: a feature file
  Background: a background
    Given a step
  Scenario: a scenario
    When a step
    Then a step`,
            [],
        ],
        ["without Rule: no scenarios", "Feature: a feature file", []],
        [
            "without Rule: only scenarios",
            `Feature: a feature file
  Scenario: a scenario
    Given a step
    When a step`,
            [],
        ],
    ];
}

function getInvalidTestData() {
    return [
        [
            "with Rule: Background",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      When a step
      Then a step
      And a step
      But a step`,
            [
                generateProblem({ line: 4, column: 7 }),
                generateProblem({ line: 5, column: 7 }),
                generateProblem({ line: 7, column: 7 }),
            ],
        ],
        [
            "with Rule: Background - Scenario",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      When a step
    Scenario: a scenario
      Then a step`,
            [generateProblem({ line: 4, column: 7 })],
        ],
        [
            "with Rule: multiple Rules",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
      When a step
    Scenario: a scenario
      Given a step
      When a step
  Rule: a rule
    Background: a background
      Given a step
      Then a step`,
            [
                generateProblem({ line: 5, column: 7 }),
                generateProblem({ line: 12, column: 7 }),
            ],
        ],
        [
            "without Rule: Background",
            `Feature: a feature file
  Background: a background
    Given a step
    When a step
    Then a step
    And a step
    But a step`,
            [
                generateProblem({ line: 4, column: 5 }),
                generateProblem({ line: 5, column: 5 }),
                generateProblem({ line: 7, column: 5 }),
            ],
        ],
        [
            "without Rule: Background - Scenario Outline",
            `Feature: a feature file
  Background: a background
    Given a step
    When a step
  Scenario Outline: a scenario
    When a step
    Then a step`,
            [generateProblem({ line: 4, column: 5 })],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
