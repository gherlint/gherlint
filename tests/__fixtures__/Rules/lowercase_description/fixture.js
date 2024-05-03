const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const LowercaseDescription = require("../../../../lib/rules/lowercase_description");

function generateProblem(location, keyword) {
    return generator(
        LowercaseDescription,
        location,
        format(LowercaseDescription.meta.message, keyword),
        {
            applyFix: jest.fn(),
        }
    );
}

function getValidTestData() {
    return [
        [
            "Feature - Rule - Background - Scenario",
            `Feature: a feature file
  Rule: a rule
    Background: a background
    Scenario: a scenario`,
            [],
        ],
        [
            "Feature - Rule - Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario`,
            [],
        ],
        [
            "Feature - Rule - Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: a scenario`,
            [],
        ],
        [
            "Feature - Background - Scenario",
            `Feature: a feature file
  Background: a background
  Scenario: a scenario`,
            [],
        ],
        [
            "Feature - Background - Scenario Outline",
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
            "with uppercase description on Background",
            `Feature: a feature file
  Rule: a rule
    Background: A background`,
            [generateProblem({ line: 3, column: 17 }, "Background")],
        ],
        [
            "with uppercase description on Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: A scenario`,
            [generateProblem({ line: 3, column: 15 }, "Scenario")],
        ],
        [
            "with uppercase description on Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: A scenario outline`,
            [generateProblem({ line: 3, column: 23 }, "Scenario Outline")],
        ],
        [
            "with uppercase description on all keywords",
            `Feature: a feature file
  Rule: A rule
    Background: A background
    Scenario: A scenario
    Scenario Outline: A scenario outline`,
            [
                generateProblem({ line: 2, column: 9 }, "Rule"),
                generateProblem({ line: 3, column: 17 }, "Background"),
                generateProblem({ line: 4, column: 15 }, "Scenario"),
                generateProblem({ line: 5, column: 23 }, "Scenario Outline"),
            ],
        ],
        [
            "with uppercase description on Feature",
            `Feature: A feature file
  Background: a background`,
            [generateProblem({ line: 1, column: 10 }, "Feature")],
        ],
        [
            "with uppercase description on Feature and Scenario",
            `Feature: A feature file
  Background: a background
  Scenario: A scenario`,
            [
                generateProblem({ line: 1, column: 10 }, "Feature"),
                generateProblem({ line: 3, column: 13 }, "Scenario"),
            ],
        ],
    ];
}

function getInvalidTestDataWithFix() {
    return [
        [
            "with uppercase description on Feature",
            `Feature: A feature file
  Background: a background`,
            generateProblem({ line: 1, column: 10 }, "Feature"),
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "with uppercase description on Rule",
            `Feature: a feature file
  Rule: A rule
    Background: a background`,
            generateProblem({ line: 2, column: 9 }, "Rule"),
            `Feature: a feature file
  Rule: a rule
    Background: a background`,
        ],
        [
            "with uppercase description on Background",
            `Feature: a feature file
  Background: A background`,
            generateProblem({ line: 2, column: 15 }, "Background"),
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "with uppercase description on Scenario",
            `Feature: a feature file
  Rule: a rule
    Scenario: A scenario`,
            generateProblem({ line: 3, column: 15 }, "Scenario"),
            `Feature: a feature file
  Rule: a rule
    Scenario: a scenario`,
        ],
        [
            "with uppercase description on Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Scenario Outline: A scenario outline`,
            generateProblem({ line: 3, column: 23 }, "Scenario Outline"),
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
