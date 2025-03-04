const generator = require("../../../helpers/problemGenerator");
const RequireWhenStep = require("../../../../lib/rules/require_when_step");

function generateProblem(location) {
    return generator(
        RequireWhenStep,
        location,
        RequireWhenStep.meta.message
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
                generateProblem({ line: 5, column: 7 }),
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
        Then a step`,
            [
                generateProblem({ line: 6, column: 9 }),
                generateProblem({ line: 8, column: 9 }),
            ],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
