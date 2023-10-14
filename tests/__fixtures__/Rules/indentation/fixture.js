const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const Indentation = require("../../../../lib/rules/indentation");

function getFixData(expectedIndent, content) {
    const data = {
        indent: " ".repeat(expectedIndent),
    };
    if (content) {
        // eslint-disable-next-line quotes
        data.ast = { content, delimiter: '"""' };
    }
    return data;
}

function generateProblem(location, expectedIndent, actualIndent, content) {
    return generator(
        Indentation,
        location,
        format(Indentation.meta.message, expectedIndent, actualIndent),
        {
            fixData: getFixData(expectedIndent, content),
            applyFix: jest.fn(),
        }
    );
}

function getValidTestData() {
    return [
        [
            "with Rule",
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
        ],
        [
            "without Rule",
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
        ],
    ];
}

function getInvalidTestData() {
    return [
        [
            "invalid tag indentation",
            ` @tag1
Feature: a feature file`,
            [generateProblem({ line: 1, column: 2 }, 0, 1)],
            `@tag1
Feature: a feature file`,
        ],
        [
            "invalid Feature indentation",
            "   Feature: a feature file",
            [generateProblem({ line: 1, column: 4 }, 0, 3)],
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
                generateProblem({ line: 2, column: 1 }, 2, 0),
                // less indent
                generateProblem({ line: 3, column: 2 }, 2, 1),
                // more indent
                generateProblem({ line: 4, column: 5 }, 2, 4),
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
                generateProblem({ line: 2, column: 1 }, 2, 0),
                // less indent
                generateProblem({ line: 4, column: 2 }, 2, 1),
                // more indent
                generateProblem({ line: 6, column: 5 }, 2, 4),
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
            [generateProblem({ line: 2, column: 1 }, 2, 0)],
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "invalid Background indentation (less indent)",
            `Feature: a feature file
 Background: a background`,
            [generateProblem({ line: 2, column: 2 }, 2, 1)],
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "invalid Background indentation (more indent)",
            `Feature: a feature file
    Background: a background`,
            [generateProblem({ line: 2, column: 5 }, 2, 4)],
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "invalid Background Step indentation (no indent)",
            `Feature: a feature file
  Background: a background
Given a step`,
            [generateProblem({ line: 3, column: 1 }, 4, 0)],
            `Feature: a feature file
  Background: a background
    Given a step`,
        ],
        [
            "invalid Background Step indentation (less indent)",
            `Feature: a feature file
  Background: a background
  Given a step`,
            [generateProblem({ line: 3, column: 3 }, 4, 2)],
            `Feature: a feature file
  Background: a background
    Given a step`,
        ],
        [
            "invalid Background Step indentation (more indent)",
            `Feature: a feature file
  Background: a background
      Given a step`,
            [generateProblem({ line: 3, column: 7 }, 4, 6)],
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
                generateProblem({ line: 2, column: 1 }, 2, 0),
                // less indent
                generateProblem({ line: 3, column: 2 }, 2, 1),
                // more indent
                generateProblem({ line: 4, column: 5 }, 2, 4),
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
                generateProblem({ line: 2, column: 1 }, 2, 0),
                // less indent
                generateProblem({ line: 4, column: 2 }, 2, 1),
                // more indent
                generateProblem({ line: 6, column: 5 }, 2, 4),
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
                generateProblem({ line: 3, column: 1 }, 4, 0),
                // less indent
                generateProblem({ line: 5, column: 3 }, 4, 2),
                // more indent
                generateProblem({ line: 7, column: 7 }, 4, 6),
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
                generateProblem({ line: 4, column: 1 }, 6, 0),
                // less indent
                generateProblem({ line: 5, column: 5 }, 6, 4),
                // more indent
                generateProblem({ line: 6, column: 9 }, 6, 8),
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
                generateProblem({ line: 4, column: 1 }, 6, 0, "multiline text"),
                // less indent
                generateProblem({ line: 8, column: 5 }, 6, 4, "multiline text"),
                // more indent
                generateProblem(
                    { line: 12, column: 9 },
                    6,
                    8,
                    "multiline text"
                ),
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
            true, // is docstring
        ],
        [
            "invalid DocString indentation (invalid on content)",
            `Feature: a feature file
  Scenario: a scenario
    Given a step with docstring
      """
  multiline text
      """`,
            [generateProblem({ line: 5, column: 3 }, 6, 2, "multiline text")],
            `Feature: a feature file
  Scenario: a scenario
    Given a step with docstring
      """
      multiline text
      """`,
            true, // is docstring
        ],
        [
            "invalid DocString indentation (invalid on docstring end)",
            `Feature: a feature file
  Scenario: a scenario
    Given a step with docstring
      """
      multiline text
    """`,
            [generateProblem({ line: 6, column: 5 }, 6, 4, "multiline text")],
            `Feature: a feature file
  Scenario: a scenario
    Given a step with docstring
      """
      multiline text
      """`,
            true, // is docstring
        ],
        [
            "invalid Scenario Outline indentation",
            `Feature: a feature file
Scenario Outline: a scenario
 Scenario Outline: a scenario
    Scenario Outline: a scenario`,
            [
                // no indent
                generateProblem({ line: 2, column: 1 }, 2, 0),
                // less indent
                generateProblem({ line: 3, column: 2 }, 2, 1),
                // more indent
                generateProblem({ line: 4, column: 5 }, 2, 4),
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
                generateProblem({ line: 3, column: 1 }, 4, 0),
                // less indent
                generateProblem({ line: 5, column: 3 }, 4, 2),
                // more indent
                generateProblem({ line: 7, column: 7 }, 4, 6),
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
                generateProblem({ line: 3, column: 1 }, 4, 0),
                // less indent
                generateProblem({ line: 6, column: 3 }, 4, 2),
                // more indent
                generateProblem({ line: 9, column: 7 }, 4, 6),
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
                generateProblem({ line: 4, column: 1 }, 6, 0),
                // less indent
                generateProblem({ line: 5, column: 5 }, 6, 4),
                // more indent
                generateProblem({ line: 6, column: 9 }, 6, 8),
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
                generateProblem({ line: 1, column: 7 }, 0, 6),
                generateProblem({ line: 2, column: 2 }, 0, 1),
                generateProblem({ line: 5, column: 5 }, 2, 4),
                generateProblem({ line: 6, column: 1 }, 2, 0),
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

function getTestDataWithFix(multilineFix = false) {
    if (multilineFix) {
        /**
         * DocString test data
         */
        return [
            [
                "DocString (1)",
                `Feature: a feature file
  Scenario: a scenario
    When a step
    """
some text
    content
          end
    """`,
                generateProblem(
                    { line: 4, column: 5 },
                    6,
                    4,
                    "some text\ncontent\n      end"
                ),
                `Feature: a feature file
  Scenario: a scenario
    When a step
      """
      some text
      content
            end
      """`,
            ],
            [
                "DocString (2)",
                `Feature: a feature file
  Scenario: a scenario
    When a step
"""
    some text
content
end
            """`,
                generateProblem(
                    { line: 4, column: 1 },
                    6,
                    0,
                    "    some text\ncontent\nend"
                ),
                `Feature: a feature file
  Scenario: a scenario
    When a step
      """
          some text
      content
      end
      """`,
            ],
            // uncomment below test cases after the issue with docstring has been fixed
            // Issue: https://github.com/gherlint/gherlint/issues/19

            //             [
            //                 "DocString (3)",
            //                 `Feature: a feature file
            //   Scenario: a scenario
            //     When a step
            //       """
            //       some text
            //       end
            // """`,
            //                 generateProblem({ line: 7, column: 1 }, 6, 0),
            //                 `Feature: a feature file
            //   Scenario: a scenario
            //     When a step
            //       """
            //       some text
            //       end
            //       """`,
            //             ],
            //             [
            //                 "DocString (4)",
            //                 `Feature: a feature file
            //   Scenario: a scenario
            //     When a step
            //       """
            //         some text
            //  end
            //       """`,
            //                 generateProblem({ line: 6, column: 2 }, 6, 1),
            //                 `Feature: a feature file
            //   Scenario: a scenario
            //     When a step
            //       """
            //         some text
            //       end
            //       """`,
            //             ],
        ];
    }

    /**
     * single line indent test data
     */
    return [
        [
            "Feature tag",
            ` @tag1
Feature: a feature file`,
            generateProblem({ line: 1, column: 2 }, 0, 1),
            `@tag1
Feature: a feature file`,
        ],
        [
            "Feature multiline tags",
            `@tag1
  @tag2
Feature: a feature file`,
            generateProblem({ line: 2, column: 3 }, 0, 2),
            `@tag1
@tag2
Feature: a feature file`,
        ],
        [
            "Feature",
            "   Feature: a feature file",
            generateProblem({ line: 1, column: 4 }, 0, 3),
            "Feature: a feature file",
        ],
        [
            "Rule",
            `Feature: a feature file
Rule: a rule`,
            generateProblem({ line: 2, column: 1 }, 2, 0),
            `Feature: a feature file
  Rule: a rule`,
        ],
        [
            "Rule tag",
            `Feature: a feature file
@tag
  Rule: a rule`,
            generateProblem({ line: 2, column: 1 }, 2, 0),
            `Feature: a feature file
  @tag
  Rule: a rule`,
        ],
        [
            "Rule multiline tag",
            `Feature: a feature file
  @tag1
    @tag2
  Rule: a rule`,
            generateProblem({ line: 3, column: 5 }, 2, 4),
            `Feature: a feature file
  @tag1
  @tag2
  Rule: a rule`,
        ],
        [
            "Background (with Rule)",
            `Feature: a feature file
  Rule: a rule
  Background: a background`,
            generateProblem({ line: 3, column: 3 }, 4, 2),
            `Feature: a feature file
  Rule: a rule
    Background: a background`,
        ],
        [
            "Step (with Rule)",
            `Feature: a feature file
  Rule: a rule
    Background: a background
Given a step`,
            generateProblem({ line: 4, column: 1 }, 6, 0),
            `Feature: a feature file
  Rule: a rule
    Background: a background
      Given a step`,
        ],
        [
            "Background",
            `Feature: a feature file
Background: a background`,
            generateProblem({ line: 2, column: 1 }, 2, 0),
            `Feature: a feature file
  Background: a background`,
        ],
        [
            "Background step",
            `Feature: a feature file
  Background: a background
Given a step`,
            generateProblem({ line: 3, column: 1 }, 4, 0),
            `Feature: a feature file
  Background: a background
    Given a step`,
        ],
        [
            "Scenario",
            `Feature: a feature file
        Scenario: a scenario`,
            generateProblem({ line: 2, column: 9 }, 2, 8),
            `Feature: a feature file
  Scenario: a scenario`,
        ],
        [
            "Scenario tag",
            `Feature: a feature file
      @tag
  Scenario: a scenario`,
            generateProblem({ line: 2, column: 7 }, 2, 6),
            `Feature: a feature file
  @tag
  Scenario: a scenario`,
        ],
        [
            "Scenario multiline tag",
            `Feature: a feature file
  @tag1
@tag2
  Scenario: a scenario`,
            generateProblem({ line: 3, column: 1 }, 2, 0),
            `Feature: a feature file
  @tag1
  @tag2
  Scenario: a scenario`,
        ],
        [
            "Scenario step",
            `Feature: a feature file
  Scenario: a scenario
      When a step`,
            generateProblem({ line: 3, column: 7 }, 4, 6),
            `Feature: a feature file
  Scenario: a scenario
    When a step`,
        ],
        [
            "Scenario datatable",
            `Feature: a feature file
  Scenario: a scenario
    When a step
    | col1 |`,
            generateProblem({ line: 4, column: 5 }, 6, 4),
            `Feature: a feature file
  Scenario: a scenario
    When a step
      | col1 |`,
        ],
        [
            "Scenario multiline datatable",
            `Feature: a feature file
  Scenario: a scenario
    When a step
      | row1 |
| row2 |`,
            generateProblem({ line: 5, column: 1 }, 6, 0),
            `Feature: a feature file
  Scenario: a scenario
    When a step
      | row1 |
      | row2 |`,
        ],
        [
            "Scenario Outline",
            `Feature: a feature file
 Scenario Outline: a scenario`,
            generateProblem({ line: 2, column: 2 }, 2, 1),
            `Feature: a feature file
  Scenario Outline: a scenario`,
        ],
        [
            "Examples",
            `Feature: a feature file
  Scenario Outline: a scenario
  Examples:`,
            generateProblem({ line: 3, column: 3 }, 4, 2),
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:`,
        ],
        [
            "Example table",
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:
  | test1  | data1  |`,
            generateProblem({ line: 4, column: 3 }, 6, 2),
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:
      | test1  | data1  |`,
        ],
        [
            "Example table multiple rows",
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:
      | test1  | data1  |
            | test2  | data2  |`,
            generateProblem({ line: 5, column: 13 }, 6, 12),
            `Feature: a feature file
  Scenario Outline: a scenario
    Examples:
      | test1  | data1  |
      | test2  | data2  |`,
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
    getTestDataWithFix,
};
