const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const NoButInGivenWhen = require("../../../../lib/rules/no_but_in_given_when");

function generateProblem(location, keyword) {
    return generator(
        NoButInGivenWhen,
        location,
        format(NoButInGivenWhen.meta.message, keyword)
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
      But a step
      When a step
      But a step
      Then a step
      But a step`,
            [
                generateProblem({ line: 5, column: 7 }, "Given"),
                generateProblem({ line: 7, column: 7 }, "When"),
            ],
        ],
        [
            "with Rule: Background",
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step
      But a step
      Scenario: a scenario
        When a step
        And a step
        But a step
        And a step
        Then a step
        And a step
        But a step
      Scenario Outline: a scenario outline
        When a step
        But a step
        Then a step`,
            [
                generateProblem({ line: 5, column: 7 }, "Given"),  
                generateProblem({ line: 9, column: 9 }, "When"),
                generateProblem({ line: 16, column: 9 }, "When"),
            ],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
