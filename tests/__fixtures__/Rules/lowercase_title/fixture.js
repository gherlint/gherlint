const generator = require("../../../helpers/problemGenerator");
const LowercaseTitle = require("../../../../lib/rules/lowercase_title");

function generateProblem(location) {
    return generator(LowercaseTitle, location, LowercaseTitle.meta.message, {
        applyFix: jest.fn(),
    });
}

function getValidTestData() {
    return [
        [
            "Feature - Rule - Background - Scenario - Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Background: a background
    Scenario: a scenario
    Scenario Outline: a scenario`,
            [],
        ],
        [
            "Feature - Rule - Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario`,
            [],
        ],
    ];
}

function getInvalidTestData() {
    return [
        [
            "with uppercase title on Background",
            `Feature: a feature file
  Rule: a rule
    Background: A background`,
            [generateProblem({ line: 3, column: 15 })],
        ],
        [
            "with uppercase title on Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: A scenario`,
            [generateProblem({ line: 3, column: 13 })],
        ],
        [
            "with uppercase title on Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: A scenario outline`,
            [generateProblem({ line: 3, column: 21 })],
        ],
        [
            "with uppercase title on all keywords",
            `Feature: a feature file
  Rule: A rule
    Background: A background
    Scenario: A scenario
    Scenario Outline: A scenario outline`,
            [
                generateProblem({ line: 2, column: 7 }),
                generateProblem({ line: 3, column: 15 }),
                generateProblem({ line: 4, column: 13 }),
                generateProblem({ line: 5, column: 21 }),
            ],
        ],
        [
            "with uppercase title on Feature",
            `Feature: A feature file
  Background: a background`,
            [generateProblem({ line: 1, column: 8 })],
        ],
        [
            "with uppercase title on Feature and Scenario",
            `Feature: A feature file
  Background: a background
  Scenario: A scenario`,
            [
                generateProblem({ line: 1, column: 8 }),
                generateProblem({ line: 3, column: 11 }),
            ],
        ],
    ];
}

function getInvalidTestDataWithFix() {
    return [
        [
            "with uppercase title on Feature",
            `Feature: A feature file
  Background: a background`,
            generateProblem({ line: 1, column: 8 }),
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "with uppercase title on Rule",
            `Feature: a feature file
  Rule: A rule
    Background: a background`,
            generateProblem({ line: 2, column: 7 }),
            `Feature: a feature file
  Rule: a rule
    Background: a background`,
        ],
        [
            "with uppercase title on Background",
            `Feature: a feature file
  Background: A background`,
            generateProblem({ line: 2, column: 13 }),
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "with uppercase title on Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: A scenario`,
            generateProblem({ line: 3, column: 13 }),
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario`,
        ],
        [
            "with uppercase title on Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: A scenario outline`,
            generateProblem({ line: 3, column: 21 }),
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: a scenario outline`,
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
    getInvalidTestDataWithFix,
};
