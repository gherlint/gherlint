const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const NoRepetitiveStepKeyword = require("../../../../lib/rules/no_repetitive_step_keyword");

function generateProblem(location, stepKeyword) {
    return generator(
        NoRepetitiveStepKeyword,
        location,
        format(NoRepetitiveStepKeyword.meta.message, stepKeyword),
        {
            fixData: {
                keyword: stepKeyword,
            },
            applyFix: jest.fn(),
        }
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
function getInvalidTestData() {
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
        ],
    ];
}

function getInvalidTestDataWithFix() {
    return [
        [
            "with Rule: Background - Given",
            `Feature: a feature file
Rule: a rule
  Background: a background
    Given a step
    Given astep`,
            generateProblem({ line: 5, column: 7 }, "Given"),
            `Feature: a feature file
Rule: a rule
  Background: a background
    Given a step
    And astep`,
        ],
        [
            "without Rule: Background - Given",
            `Feature: a feature file
Background: a background
  Given a step
  Given astep`,
            generateProblem({ line: 4, column: 5 }, "Given"),
            `Feature: a feature file
Background: a background
  Given a step
  And astep`,
        ],
        [
            "without Rule: Scenario - When",
            `Feature: a feature file
Scenario: a scenario
  When a step
  When a step`,
            generateProblem({ line: 4, column: 5 }, "When"),
            `Feature: a feature file
Scenario: a scenario
  When a step
  And a step`,
        ],
        [
            "without Rule: Scenario - Then",
            `Feature: a feature file
Scenario: a scenario
  When a step
  Then a step
  Then a step`,
            generateProblem({ line: 5, column: 5 }, "Then"),
            `Feature: a feature file
Scenario: a scenario
  When a step
  Then a step
  And a step`,
        ],
        [
            "without Rule: Scenario - But",
            `Feature: a feature file
Scenario: a scenario
  When a step
  Then a step
  But a step
  But a step`,
            generateProblem({ line: 6, column: 5 }, "But"),
            `Feature: a feature file
Scenario: a scenario
  When a step
  Then a step
  But a step
  And a step`,
        ],
        [
            "without Rule: Scenario Outline - Given",
            `Feature: a feature file
Scenario Outline: a scenario outline
  Given a step
  Given a step`,
            generateProblem({ line: 4, column: 5 }, "Given"),
            `Feature: a feature file
Scenario Outline: a scenario outline
  Given a step
  And a step`,
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
    getInvalidTestDataWithFix,
};
