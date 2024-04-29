const generator = require("../../../helpers/problemGenerator");
const NoThenAsFirstStep = require("../../../../lib/rules/no_then_as_first_step");

function generateProblem(location) {
    return generator(
        NoThenAsFirstStep,
        location,
        NoThenAsFirstStep.meta.message
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
            "with Rule: Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario
      Given a step`,
            [],
        ],
        [
            "with Rule: Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: a scenario outline
      Given a step`,
            [],
        ],
        [
            "with Rule: multiple scenarios",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
    Scenario: a scenario
      Given a step
    Scenario Outline: a scenario outline
      Given a step`,
            [],
        ],
        [
            "with Rule: multiple steps",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
      Then a step
    Scenario: a scenario
      Given a step
      When a step
      Then a step
    Scenario Outline: a scenario outline
      Given a step
      Then a step`,
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
            "without Rule: Scenario",
            `Feature: a feature file
  Scenario: a scenario
    When a step`,
            [],
        ],
        [
            "without Rule: Scenario Outline",
            `Feature: a feature file
  Scenario Outline: a scenario
    When a step`,
            [],
        ],
        [
            "without Rule: multiple scenarios",
            `Feature: a feature file
  Background: a background
    Given a step
  Scenario: a scenario
    When a step
  Scenario Outline: a scenario outline
    When a step`,
            [],
        ],
        [
            "without Rule: multiple steps",
            `Feature: a feature file
  Scenario: a scenario
    Given a step
    When a step
    Then a step
  Scenario: a scenario
    When a step
    Then a step`,
            [],
        ],
        [
            "with Rule: no scenarios",
            `Feature: a feature file
  Rule: a rule`,
            [],
        ],
        ["without Rule: no scenarios", "Feature: a feature file", []],
        [
            "without Rule: no steps",
            `Feature: a feature file
  Scenario: a scenario`,
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
      Then a step`,
            [generateProblem({ line: 4, column: 7 })],
        ],
        [
            "with Rule: Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario
      Then a step`,
            [generateProblem({ line: 4, column: 7 })],
        ],
        [
            "with Rule: Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: a scenario outline
      Then a step`,
            [generateProblem({ line: 4, column: 7 })],
        ],
        [
            "with Rule: multiple scenarios",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Then a step
    Scenario: a scenario
      Then a step
    Scenario Outline: a scenario outline
      Then a step`,
            [
                generateProblem({ line: 4, column: 7 }),
                generateProblem({ line: 6, column: 7 }),
                generateProblem({ line: 8, column: 7 }),
            ],
        ],
        [
            "without Rule: Background",
            `Feature: a feature file
  Background: a background
    Then a step`,
            [generateProblem({ line: 3, column: 5 })],
        ],
        [
            "without Rule: Scenario",
            `Feature: a feature file
  Scenario: a scenario
    Then a step`,
            [generateProblem({ line: 3, column: 5 })],
        ],
        [
            "without Rule: Scenario Outline",
            `Feature: a feature file
  Scenario Outline: a scenario outline
    Then a step`,
            [generateProblem({ line: 3, column: 5 })],
        ],
        [
            "without Rule: multiple scenarios",
            `Feature: a feature file
  Background: a background
    Then a step
  Scenario: a scenario
    Then a step
  Scenario Outline: a scenario outline
    Then a step`,
            [
                generateProblem({ line: 3, column: 5 }),
                generateProblem({ line: 5, column: 5 }),
                generateProblem({ line: 7, column: 5 }),
            ],
        ],
        [
            "without Rule: valid and invalid",
            `Feature: a feature file
  Background: a background
    Given a step
  Scenario: a scenario
    When a step
    Then a step
  Scenario: a scenario
    Then a step`,
            [generateProblem({ line: 8, column: 5 })],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
