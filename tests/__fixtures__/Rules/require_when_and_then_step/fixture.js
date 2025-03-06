const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const RequireWhenAndThenStep = require("../../../../lib/rules/require_when_and_then_step");

function generateProblem(location, keyword) {
    return generator(
        RequireWhenAndThenStep,
        location,
        format(RequireWhenAndThenStep.meta.message, keyword)
    );
}

function getValidTestData() {
    return [
        [
            "with Rule: Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario
      Given a step
      When a step
      Then a step`,
            [],
        ],
        [
            "with Rule: Background",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
    Scenario: a scenario
      When a step
      And a step
      Then a step
      And a step
      But a step
    Scenario Outline: a scenario outline
      When a step
      Then a step`,
            [],
        ],
        [
            "with Rule: Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: a scenario
      Given a step
      When a step
      Then a step
      But a step`,
            [],
        ],
    ];
}

function getInvalidTestData() {
    return [
        [
            "with Rule: Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario
      Given a step
      Then a step`,
            [
                generateProblem({ line: 5, column: 7 }, "When")
            ],
        ],
        [
            "with Rule: Background",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
      Scenario: a scenario
        Then a step
      Scenario Outline: a scenario outline
        When a step`,
            [
                generateProblem({ line: 6, column: 9 }, "When"),
                generateProblem({ line: 9, column: 9 }, "Then")
            ],
        ],
        [
          "with Rule: Background, Scenario and Scenario Outline",
          `Feature: a feature file
Rule: a rule
  Background: a background
    Given a step
    Scenario: a scenario
      When a step
    Scenario Outline: a scenario outline
      Then a step`,
          [
              generateProblem({ line: 7, column: 7 }, "Then"),
              generateProblem({ line: 8, column: 7 }, "When")
          ],
        ],
        [
          "with Rule: Scenario but No background",
          `Feature: a feature file
Rule: a rule
  Scenario: a scenario
    Given a step`,
          [
              generateProblem({ line: 5, column: 5 }, "When and Then")
          ],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
