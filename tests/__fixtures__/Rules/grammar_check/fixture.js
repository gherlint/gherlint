const generator = require("../../../helpers/problemGenerator");
const GrammarCheck = require("../../../../lib/rules/grammar_check");

function generateProblem(location) {
    return generator(GrammarCheck, location, GrammarCheck.meta.message, {
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
            `Feature: mistake,in features,description
  Rule: a rule
    Background: a Background`,
            [generateProblem({ line: 3, column: 15 })],
        ],
        //       [
        //           "with uppercase title on Scenario",
        //           `Feature: a feature file
        // Rule: a rule
        //   Scenario: A scenario`,
        //           [generateProblem({ line: 3, column: 13 })],
        //       ],
        //       [
        //           "with uppercase title on Scenario Outline",
        //           `Feature: a feature file
        // Rule: a rule
        //   Scenario Outline: A Scenario outline`,
        //           [generateProblem({ line: 3, column: 21 })],
        //       ],
        //       [
        //           "with uppercase title on all keywords",
        //           `Feature: a Feature file
        // Rule: A rule
        //   Background: A background
        //   Scenario: a Scenario
        //   Scenario Outline: A scenario Outline`,
        //           [
        //               generateProblem({ line: 1, column: 8 }),
        //               generateProblem({ line: 2, column: 7 }),
        //               generateProblem({ line: 3, column: 15 }),
        //               generateProblem({ line: 4, column: 13 }),
        //               generateProblem({ line: 5, column: 21 }),
        //           ],
        //       ],
        //       [
        //           "with uppercase title on Feature",
        //           `Feature: A feature File
        // Background: a background`,
        //           [generateProblem({ line: 1, column: 8 })],
        //       ],
        //       [
        //           "with uppercase title on Feature and Scenario",
        //           `Feature: a Feature file
        // Background: a background
        // Scenario: A scenario`,
        //           [
        //               generateProblem({ line: 1, column: 8 }),
        //               generateProblem({ line: 3, column: 11 }),
        //           ],
        //       ],
    ];
}


module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
