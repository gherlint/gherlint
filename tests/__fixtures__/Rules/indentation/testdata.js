const { format } = require("util");
const generator = require("../../../lib/helpers/problemGenerator");
const Indentation = require("../../../../lib/rules/indentation");

function generateProblem(location, expectedIndent, actualIndent, config) {
    let fixProps = {};
    if (config.cliOptions.fix) {
        fixProps = {
            fixData: {
                indent: " ".repeat(expectedIndent),
            },
            applyFix: jest.fn(),
        };
    }

    return generator(
        Indentation,
        location,
        format(Indentation.meta.message, expectedIndent, actualIndent),
        fixProps
    );
}

function getTestData(config) {
    return [
        [
            "valid indentation (with Rule)",
            `@tag1
Feature: a feature file
As a user
I want
So that
  @tag1
  @tag2
  Rule: a rule
    Background: a background
      Given a step
    @tag2
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
            `@tag1
Feature: a feature file
As a user
I want
So that
  @tag1
  @tag2
  Rule: a rule
    Background: a background
      Given a step
    @tag2
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
        ],
        [
            "valid indentation",
            `@tag1
@tag2
Feature: a feature file
As a user
I want
So that
  Background: a background
    Given a step
  @tag2 @tag1
  Scenario: a scenario
    When a step
    Then a step
  @tag2 @tag3
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
            `@tag1
@tag2
Feature: a feature file
As a user
I want
So that
  Background: a background
    Given a step
  @tag2 @tag1
  Scenario: a scenario
    When a step
    Then a step
  @tag2 @tag3
  Scenario Outline: a scenario outline
    When a data table step
      | col1 | col2 |
      | 1    | 2    |
    And a step
    But a step
    Examples:
      | test1 |
      | test2 |`,
        ],
        [
            "invalid tag indentation",
            ` @tag1
Feature: a feature file`,
            [generateProblem({ line: 1, column: 2 }, 0, 1, config)],
            `@tag1
Feature: a feature file`,
        ],
        [
            "invalid Feature indentation",
            "   Feature: a feature file",
            [generateProblem({ line: 1, column: 4 }, 0, 3, config)],
            "Feature: a feature file",
        ],
        [
            "invalid Rule indentation",
            `Feature: a feature file
Rule: a rule
 Rule: a rule
    Rule: a rule`,
            [
                // no indent
                generateProblem({ line: 2, column: 1 }, 2, 0, config),
                // less indent
                generateProblem({ line: 3, column: 2 }, 2, 1, config),
                // more indent
                generateProblem({ line: 4, column: 5 }, 2, 4, config),
            ],
            `Feature: a feature file
  Rule: a rule
  Rule: a rule
  Rule: a rule`,
        ],
        [
            "invalid Rule tag indentation",
            `Feature: a feature file
@tag1
  Rule: a rule
 @tag2
  Rule: a rule
    @tag2
  Rule: a rule`,
            [
                // no indent
                generateProblem({ line: 2, column: 1 }, 2, 0, config),
                // less indent
                generateProblem({ line: 4, column: 2 }, 2, 1, config),
                // more indent
                generateProblem({ line: 6, column: 5 }, 2, 4, config),
            ],
            `Feature: a feature file
  @tag1
  Rule: a rule
  @tag2
  Rule: a rule
  @tag2
  Rule: a rule`,
        ],
        [
            "invalid Background indentation (no indent)",
            `Feature: a feature file
Background: a background`,
            [generateProblem({ line: 2, column: 1 }, 2, 0, config)],
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "invalid Background indentation (less indent)",
            `Feature: a feature file
 Background: a background`,
            [generateProblem({ line: 2, column: 2 }, 2, 1, config)],
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "invalid Background indentation (more indent)",
            `Feature: a feature file
    Background: a background`,
            [generateProblem({ line: 2, column: 5 }, 2, 4, config)],
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "invalid Background Step indentation (no indent)",
            `Feature: a feature file
  Background: a background
Given a step`,
            [generateProblem({ line: 3, column: 1 }, 4, 0, config)],
            `Feature: a feature file
  Background: a background
    Given a step`,
        ],
        [
            "invalid Background Step indentation (less indent)",
            `Feature: a feature file
  Background: a background
  Given a step`,
            [generateProblem({ line: 3, column: 3 }, 4, 2, config)],
            `Feature: a feature file
  Background: a background
    Given a step`,
        ],
        [
            "invalid Background Step indentation (more indent)",
            `Feature: a feature file
  Background: a background
      Given a step`,
            [generateProblem({ line: 3, column: 7 }, 4, 6, config)],
            `Feature: a feature file
  Background: a background
    Given a step`,
        ],
        [
            "invalid Scenario indentation",
            `Feature: a feature file
Scenario: a scenario
 Scenario: a scenario
    Scenario: a scenario`,
            [
                // no indent
                generateProblem({ line: 2, column: 1 }, 2, 0, config),
                // less indent
                generateProblem({ line: 3, column: 2 }, 2, 1, config),
                // more indent
                generateProblem({ line: 4, column: 5 }, 2, 4, config),
            ],
            `Feature: a feature file
  Scenario: a scenario
  Scenario: a scenario
  Scenario: a scenario`,
        ],
        [
            "invalid Scenario tag indentation",
            `Feature: a feature file
@tag1
  Scenario: a scenario
 @tag2
  Scenario: a scenario
    @tag3
  Scenario: a scenario`,
            [
                // no indent
                generateProblem({ line: 2, column: 1 }, 2, 0, config),
                // less indent
                generateProblem({ line: 4, column: 2 }, 2, 1, config),
                // more indent
                generateProblem({ line: 6, column: 5 }, 2, 4, config),
            ],
            `Feature: a feature file
  @tag1
  Scenario: a scenario
  @tag2
  Scenario: a scenario
  @tag3
  Scenario: a scenario`,
        ],
        [
            "invalid Scenario Step indentation",
            `Feature: a feature file
  Scenario: a scenario
Given a step
  Scenario: a scenario
  Given a step
  Scenario: a scenario
      Given a step`,
            [
                // no indent
                generateProblem({ line: 3, column: 1 }, 4, 0, config),
                // less indent
                generateProblem({ line: 5, column: 3 }, 4, 2, config),
                // more indent
                generateProblem({ line: 7, column: 7 }, 4, 6, config),
            ],
            `Feature: a feature file
  Scenario: a scenario
    Given a step
  Scenario: a scenario
    Given a step
  Scenario: a scenario
    Given a step`,
        ],
        [
            "invalid DataTable indentation",
            `Feature: a feature file
  Scenario: a scenario
    Given a step with datatable
| col1 | col2 |
    | data1 | data2 |
        | data3 | data4 |`,
            [
                // no indent
                generateProblem({ line: 4, column: 1 }, 6, 0, config),
                // less indent
                generateProblem({ line: 5, column: 5 }, 6, 4, config),
                // more indent
                generateProblem({ line: 6, column: 9 }, 6, 8, config),
            ],
            `Feature: a feature file
  Scenario: a scenario
    Given a step with datatable
      | col1 | col2 |
      | data1 | data2 |
      | data3 | data4 |`,
        ],
        [
            "invalid DocString indentation",
            `Feature: a feature file
  Scenario: a scenario
    Given a step with docstring
"""
multiline text
"""
    Given a step with docstring
    """
    multiline text
    """
    Given a step with docstring
        """
        multiline text
        """`,
            [
                // no indent
                generateProblem({ line: 4, column: 1 }, 6, 0, config),
                // less indent
                generateProblem({ line: 8, column: 5 }, 6, 4, config),
                // more indent
                generateProblem({ line: 12, column: 9 }, 6, 8, config),
            ],
            `Feature: a feature file
  Scenario: a scenario
    Given a step with docstring
      """
      multiline text
      """
    Given a step with docstring
      """
      multiline text
      """
    Given a step with docstring
      """
      multiline text
      """`,
        ],
        [
            "invalid Scenario Outline indentation",
            `Feature: a feature file
Scenario Outline: a scenario
 Scenario Outline: a scenario
    Scenario Outline: a scenario`,
            [
                // no indent
                generateProblem({ line: 2, column: 1 }, 2, 0, config),
                // less indent
                generateProblem({ line: 3, column: 2 }, 2, 1, config),
                // more indent
                generateProblem({ line: 4, column: 5 }, 2, 4, config),
            ],
            `Feature: a feature file
  Scenario Outline: a scenario
  Scenario Outline: a scenario
  Scenario Outline: a scenario`,
        ],
        [
            "invalid Examples indentation",
            `Feature: a feature file
  Scenario Outline: a scenario
Examples:
  Scenario Outline: a scenario
  Examples:
  Scenario Outline: a scenario
      Examples:`,
            [
                // no indent
                generateProblem({ line: 3, column: 1 }, 4, 0, config),
                // less indent
                generateProblem({ line: 5, column: 3 }, 4, 2, config),
                // more indent
                generateProblem({ line: 7, column: 7 }, 4, 6, config),
            ],
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:
  Scenario Outline: a scenario
    Examples:
  Scenario Outline: a scenario
    Examples:`,
        ],
        [
            "invalid Examples tag indentation",
            `Feature: a feature file
  Scenario Outline: a scenario
@tag1
    Examples:
  Scenario Outline: a scenario
  @tag1
    Examples:
  Scenario Outline: a scenario
      @tag1
    Examples:`,
            [
                // no indent
                generateProblem({ line: 3, column: 1 }, 4, 0, config),
                // less indent
                generateProblem({ line: 6, column: 3 }, 4, 2, config),
                // more indent
                generateProblem({ line: 9, column: 7 }, 4, 6, config),
            ],
            `Feature: a feature file
  Scenario Outline: a scenario
    @tag1
    Examples:
  Scenario Outline: a scenario
    @tag1
    Examples:
  Scenario Outline: a scenario
    @tag1
    Examples:`,
        ],
        [
            "invalid Example table indentation",
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:
| col1  |
    | data1 |
        | data1 |`,
            [
                // no indent
                generateProblem({ line: 4, column: 1 }, 6, 0, config),
                // less indent
                generateProblem({ line: 5, column: 5 }, 6, 4, config),
                // more indent
                generateProblem({ line: 6, column: 9 }, 6, 8, config),
            ],
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:
      | col1  |
      | data1 |
      | data1 |`,
        ],
        [
            "invalid multiline tags",
            `      @tag1
 @tag1
Feature: a feature

    @tag1
@tag2
  Scenario: a scenario`,
            [
                generateProblem({ line: 1, column: 7 }, 0, 6, config),
                generateProblem({ line: 2, column: 2 }, 0, 1, config),
                generateProblem({ line: 5, column: 5 }, 2, 4, config),
                generateProblem({ line: 6, column: 1 }, 2, 0, config),
            ],
            `@tag1
@tag1
Feature: a feature

  @tag1
  @tag2
  Scenario: a scenario`,
        ],
    ];
}

module.exports = {
    generateProblem,
    getTestData,
};