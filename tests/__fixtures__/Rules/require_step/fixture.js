const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const RequireStep = require("../../../../lib/rules/require_step");

function generateProblem(location, stepKeyword) {
    return generator(
        RequireStep,
        location,
        format(RequireStep.meta.message, stepKeyword)
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
    Given a step`,
            [],
        ],
        [
            "without Rule: Scenario Outline",
            `Feature: a feature file
  Scenario Outline: a scenario
    Given a step`,
            [],
        ],
        [
            "without Rule: multiple scenarios",
            `Feature: a feature file
  Background: a background
    Given a step
  Scenario: a scenario
    Given a step
  Scenario Outline: a scenario outline
    Given a step`,
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
    Background: a background`,
            [generateProblem({ line: 3, column: 5 }, "Background")],
        ],
        [
            "with Rule: Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario`,
            [generateProblem({ line: 3, column: 5 }, "Scenario")],
        ],
        [
            "with Rule: Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: a scenario outline`,
            [generateProblem({ line: 3, column: 5 }, "Scenario Outline")],
        ],
        [
            "with Rule: multiple scenarios",
            `Feature: a feature file
  Rule: a rule
    Background: a background
    Scenario: a scenario
    Scenario Outline: a scenario outline`,
            [
                generateProblem({ line: 3, column: 5 }, "Background"),
                generateProblem({ line: 4, column: 5 }, "Scenario"),
                generateProblem({ line: 5, column: 5 }, "Scenario Outline"),
            ],
        ],
        [
            "without Rule: Background",
            `Feature: a feature file
  Background: a background`,
            [generateProblem({ line: 2, column: 3 }, "Background")],
        ],
        [
            "without Rule: Scenario",
            `Feature: a feature file
  Scenario: a scenario`,
            [generateProblem({ line: 2, column: 3 }, "Scenario")],
        ],
        [
            "without Rule: Scenario Outline",
            `Feature: a feature file
  Scenario Outline: a scenario outline`,
            [generateProblem({ line: 2, column: 3 }, "Scenario Outline")],
        ],
        [
            "without Rule: multiple scenarios",
            `Feature: a feature file
  Background: a background
  Scenario: a scenario
  Scenario Outline: a scenario outline`,
            [
                generateProblem({ line: 2, column: 3 }, "Background"),
                generateProblem({ line: 3, column: 3 }, "Scenario"),
                generateProblem({ line: 4, column: 3 }, "Scenario Outline"),
            ],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
