const { format } = require("util");
const generator = require("../../../lib/helpers/problemGenerator");
const NoRepetitiveSteps = require("../../../../lib/rules/no_repetitive_steps");

function generateProblem(location, stepKeyword) {
    return generator(
        NoRepetitiveSteps,
        location,
        format(NoRepetitiveSteps.meta.message, stepKeyword)
    );
}

function getValidTestData() {
    return [
        [
            "with Rule",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
    Scenario: a scenario
      When a step
      Then a step
    Scenario Outline: a scenario outline
      Given a step
      When a data table step
        | col1 | col2 |
        | 1    | 2    |
      And a step
      But a step
      Examples:
        | test1 |
        | test2 |`,
            [],
        ],
        [
            "without Rule",
            `Feature: a feature file
  Background: a background
    Given a step
  Scenario: a scenario
    When a step
    Then a step
  Scenario Outline: a scenario outline
    When a data table step
      | col1 | col2 |
      | 1    | 2    |
    And a step
    But a step
    Examples:
      | test1 |
      | test2 |`,
            [],
        ],
        [
            "Multiple And",
            `Feature: a feature file
  Background: a background
    Given a step
    And a step
    And a step`,
            [],
        ],
        [
            "Multiple *",
            `Feature: a feature file
  Background: a background
    Given a step
    * a step
    * a step`,
            [],
        ],
    ];
}
function getInvalidTestDataWithFix() {
    return [
        [
            "with Rule",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
      Given astep
    Scenario: a scenario
      When a step
      Then a step
      Then a step`,
            [
                generateProblem({ line: 5, column: 7 }, "Given"),
                generateProblem({ line: 9, column: 7 }, "Then"),
            ],
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
      And astep
    Scenario: a scenario
      When a step
      Then a step
      And a step`,
        ],
        [
            "without Rule",
            `Feature: a feature file
  Background: a background
    Given a step
    Given astep
  Scenario: a scenario
    When a step
    Then a step
    Then a step
    But a step
    But a step
  Scenario Outline: a scenario outline
    When a step
    When a step
    When a step
    Then a step
    Examples:
      | row1 |
      | row3 |`,
            [
                generateProblem({ line: 4, column: 5 }, "Given"),
                generateProblem({ line: 8, column: 5 }, "Then"),
                generateProblem({ line: 10, column: 5 }, "But"),
                generateProblem({ line: 13, column: 5 }, "When"),
                generateProblem({ line: 14, column: 5 }, "When"),
            ],
            `Feature: a feature file
  Background: a background
    Given a step
    Given astep
  Scenario: a scenario
    When a step
    Then a step
    Then a step
    But a step
    But a step
  Scenario Outline: a scenario outline
    When a step
    When a step
    Then a step
    Examples:
      | row1 |
      | row3 |`,
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestDataWithFix,
};
