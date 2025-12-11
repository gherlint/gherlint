const generator = require("../../../helpers/problemGenerator");
const ThenShouldHaveShould = require("../../../../lib/rules/then_should_have_should");

function generateProblem(location, message) {
    return generator(ThenShouldHaveShould, location, message, {
        applyFix: jest.fn(),
    });
}

function getTestData() {
    return [
        [
            "no then step",
            `Feature: ThenShouldHaveShould
  Scenario: without a Then step
    Given a feature does not have a Then step
    When the user runs the 'ThenShouldHaveShould' rule`,
            [
            ],
        ],
        [
            "correct then step",
            `Feature: ThenShouldHaveShould
  Scenario: with a Then step
    Given a feature does have a Then step
    When the user runs the 'ThenShouldHaveShould' rule
    Then every "Then" step should contain the magic word`,
            [
            ],
        ],
        [
            "then step without should",
            `Feature: ThenShouldHaveShould
  Scenario: with a Then step, but without a should
    Given a feature does have a Then step
    And the Then step does not contain a "should"
    When the user runs the 'ThenShouldHaveShould' rule
    Then an error will be thrown`,
            [
                generateProblem(
                    {line: 6, column: 5},
                    "Every Then step should contain the world 'should'"
                ),
            ],
        ],
        [
            "then step has a should, but following And does not",
            `Feature: ThenShouldHaveShould
  Scenario: with a Then step, but without a should
    Given a feature does have a Then step
    And the Then step does contain a "should"
    But the following And does not
    When the user runs the 'ThenShouldHaveShould' rule
    Then an error should be thrown
    And an error will be thrown`,
            [
                generateProblem(
                    {line: 8, column: 5},
                    "Every Then step should contain the world 'should'"
                ),
            ],
        ],
        [
            "then step has a should, but following But does not",
            `Feature: ThenShouldHaveShould
  Scenario: with a Then step, but without a should
    Given a feature does have a Then step
    And the Then step does contain a "should"
    But the following But does not
    When the user runs the 'ThenShouldHaveShould' rule
    Then an error should be thrown
    But an error will be thrown`,
            [
                generateProblem(
                    {line: 8, column: 5},
                    "Every Then step should contain the world 'should'"
                ),
            ],
        ],
        [
            "then step without should in background",
            `Feature: ThenShouldHaveShould
  Background: with a Then step, but without a should
    Given a feature does have a Then step
    And the Then step does not contain a "should"
    When the user runs the 'ThenShouldHaveShould' rule
    Then an error will be thrown`,
            [
                generateProblem(
                    {line: 6, column: 5},
                    "Every Then step should contain the world 'should'"
                ),
            ],
        ],
    ];
}

module.exports = {
    generateProblem,
    getTestData,
};
