const { format } = require("util");
const generator = require("../../../helpers/problemGenerator");
const NewlineBeforeScenario = require("../../../../lib/rules/newline_before_scenario");

function generateProblem(location, actual, expected = 1) {
    return generator(
        NewlineBeforeScenario,
        location,
        format(NewlineBeforeScenario.meta.message, expected, actual)
    );
}

function getValidTestData() {
    return [
        [
            "with Rule: Scenario",
            `Feature: a feature file
  Rule: a rule

    Scenario: a scenario`,
            [],
        ],
        [
            "with Rule: Background - Scenario",
            `Feature: a feature file
  Rule: a rule
    Background: a background

    Scenario: a scenario`,
            [],
        ],
        [
            "with Rule: Scenario Outline",
            `Feature: a feature file
  Rule: a rule

    Scenario Outline: a scenario outline`,
            [],
        ],
        [
            "with Rule: Background - Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Background: a background

    Scenario Outline: a scenario`,
            [],
        ],
        [
            "with Rule: multiple scenarios",
            `Feature: a feature file
  Rule: a rule
    Background: a background

    Scenario: a scenario

    Scenario Outline: a scenario outline`,
            [],
        ],
        [
            "with Rule: description - Scenario",
            `Feature: a feature file
  Some feature description
  is here
  Rule: a rule
    rule description here

    Scenario: a scenario`,
            [],
        ],
        [
            "with Rule: Scenario tags",
            `Feature: a feature file
  Rule: a rule

    @tag1 @tag2
    Scenario: a scenario`,
            [],
        ],
        [
            "with Rule: Scenario multiline tags",
            `Feature: a feature file
  Rule: a rule

    @tag1
    @tag2
    Scenario Outline: a scenario outline`,
            [],
        ],
        [
            "with Rule: Scenario comments",
            `Feature: a feature file
  Rule: a rule

    #comment line
    Scenario: a scenario`,
            [],
        ],
        [
            "with Rule: description - Scenario tags and comments",
            `Feature: a feature file
  feture description here
  Rule: a rule
    @tag1

    #comment line
    @tag2
    Scenario: a scenario`,
            [],
        ],
        [
            "with multiple Rules: description - Scenario tags and comments",
            `Feature: a feature file
  feture description here
  Rule: a rule
    @tag1

    #comment line
    @tag2
    Scenario: a scenario

  Rule: a rule

    #comment line
    @tag1 @tag2
    Scenario: a scenario`,
            [],
        ],
        [
            "without Rule: Scenario",
            `Feature: a feature file

  Scenario: a scenario`,
            [],
        ],
        [
            "without Rule: Background - Scenario",
            `Feature: a feature file
  Background: a background

  Scenario: a scenario`,
            [],
        ],
        [
            "without Rule: Scenario Outline",
            `Feature: a feature file

  Scenario Outline: a scenario outline`,
            [],
        ],
        [
            "without Rule: Background - Scenario Outline",
            `Feature: a feature file
  Background: a background

  Scenario Outline: a scenario`,
            [],
        ],
        [
            "without Rule: multiple scenarios",
            `Feature: a feature file
  Background: a background

  Scenario: a scenario

  Scenario Outline: a scenario outline`,
            [],
        ],
        [
            "without Rule: description - Scenario",
            `Feature: a feature file
  Some feature description
  is here

  Scenario: a scenario`,
            [],
        ],
        [
            "without Rule: Scenario tags",
            `Feature: a feature file

  @tag1 @tag2
  Scenario: a scenario`,
            [],
        ],
        [
            "without Rule: Scenario multiline tags",
            `Feature: a feature file

  @tag1
  @tag2
  Scenario Outline: a scenario outline`,
            [],
        ],
        [
            "without Rule: Scenario comments",
            `Feature: a feature file

  #comment line
  Scenario: a scenario`,
            [],
        ],
        [
            "without Rule: description - Scenario tags and comments",
            `Feature: a feature file
  feture description here
  @tag1

  #comment line
  @tag2
  Scenario: a scenario`,
            [],
        ],
        [
            "without Rule: Background - Scenario tags and comments",
            `Feature: a feature file
  feture description here

  Background: a background
    describe a background
  @tag1

  #comment line
  @tag2
  Scenario: a scenario`,
            [],
        ],
        [
            "Step datatable",
            `Feature: a feature file
  Background: a background
    Given a step
      | data1 |
      | data2 |

  Scenario: a scenario`,
            [],
        ],
        [
            "Step docstring",
            `Feature: a feature file
  Background: a background
    Given a step
      """
      multiline
      content
      """

  Scenario: a scenario`,
            [],
        ],
        [
            "Examples table",
            `Feature: a feature file

  Scenario: a scenario
    Given a step
  Examples:
      | row1 |
      | row2 |

  Scenario: a scenario`,
            [],
        ],
        [
            "with Rule: no scenarios",
            `Feature: a feature file
  Rule: a rule
    Background: a background`,
            [],
        ],
        [
            "without Rule: no scenarios",
            `Feature: a feature file
  Background: a background`,
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
    Scenario: a scenario`,
            [generateProblem({ line: 3, column: 5 }, 0)],
        ],
        [
            "with Rule: Background - Scenario",
            `Feature: a feature file
  Rule: a rule
    Background: a background


    Scenario: a scenario`,
            [generateProblem({ line: 6, column: 5 }, 2)],
        ],
        [
            "with Rule: Scenario Outline",
            `Feature: a feature file
  Rule: a rule






    Scenario Outline: a scenario outline`,
            [generateProblem({ line: 9, column: 5 }, 6)],
        ],
        [
            "with Rule: Background - Scenario Outline",
            `Feature: a feature file
  Rule: a rule
    Background: a background
    Scenario Outline: a scenario`,
            [generateProblem({ line: 4, column: 5 }, 0)],
        ],
        [
            "with Rule: multiple scenarios",
            `Feature: a feature file
  Rule: a rule
    Background: a background


    Scenario: a scenario
    Scenario Outline: a scenario outline`,
            [
                generateProblem({ line: 6, column: 5 }, 2),
                generateProblem({ line: 7, column: 5 }, 0),
            ],
        ],
        [
            "with Rule: description - Scenario",
            `Feature: a feature file
  Some feature description
  is here
  Rule: a rule
    rule description here
    Scenario: a scenario`,
            [generateProblem({ line: 6, column: 5 }, 0)],
        ],
        [
            "with Rule: Scenario tags",
            `Feature: a feature file
  Rule: a rule


    @tag1 @tag2
    Scenario: a scenario`,
            [generateProblem({ line: 6, column: 5 }, 2)],
        ],
        [
            "with Rule: Scenario multiline tags",
            `Feature: a feature file
  Rule: a rule

    @tag1

    @tag2
    Scenario Outline: a scenario outline`,
            [generateProblem({ line: 7, column: 5 }, 2)],
        ],
        [
            "with Rule: Scenario comments",
            `Feature: a feature file
  Rule: a rule
    #comment line
    Scenario: a scenario`,
            [generateProblem({ line: 4, column: 5 }, 0)],
        ],
        [
            "with Rule: description - Scenario tags and comments",
            `Feature: a feature file
  feture description here
  Rule: a rule
    @tag1

    #comment line

    @tag2

    Scenario: a scenario`,
            [generateProblem({ line: 10, column: 5 }, 3)],
        ],
        [
            "with multiple Rules: description - Scenario tags and comments",
            `Feature: a feature file
  feture description here
  Rule: a rule
    @tag1

    #comment line
    @tag2

    Scenario: a scenario

  Rule: a rule
    #comment line
    @tag1 @tag2
    Scenario: a scenario`,
            [
                generateProblem({ line: 9, column: 5 }, 2),
                generateProblem({ line: 14, column: 5 }, 0),
            ],
        ],
        [
            "without Rule: Scenario",
            `Feature: a feature file
  Scenario: a scenario`,
            [generateProblem({ line: 2, column: 3 }, 0)],
        ],
        [
            "without Rule: Background - Scenario",
            `Feature: a feature file
  Background: a background


  Scenario: a scenario`,
            [generateProblem({ line: 5, column: 3 }, 2)],
        ],
        [
            "without Rule: Scenario Outline",
            `Feature: a feature file
  Scenario Outline: a scenario outline`,
            [generateProblem({ line: 2, column: 3 }, 0)],
        ],
        [
            "without Rule: Background - Scenario Outline",
            `Feature: a feature file
  Background: a background
  Scenario Outline: a scenario`,
            [generateProblem({ line: 3, column: 3 }, 0)],
        ],
        [
            "without Rule: multiple scenarios",
            `Feature: a feature file
  Background: a background


  Scenario: a scenario



  Scenario Outline: a scenario outline`,
            [
                generateProblem({ line: 5, column: 3 }, 2),
                generateProblem({ line: 9, column: 3 }, 3),
            ],
        ],
        [
            "without Rule: description - Scenario",
            `Feature: a feature file
  Some feature description
  is here
  Scenario: a scenario`,
            [generateProblem({ line: 4, column: 3 }, 0)],
        ],
        [
            "without Rule: Scenario tags",
            `Feature: a feature file


  @tag1 @tag2

  Scenario: a scenario`,
            [generateProblem({ line: 6, column: 3 }, 3)],
        ],
        [
            "without Rule: Scenario multiline tags",
            `Feature: a feature file

  @tag1

  @tag2
  Scenario Outline: a scenario outline`,
            [generateProblem({ line: 6, column: 3 }, 2)],
        ],
        [
            "without Rule: Scenario comments",
            `Feature: a feature file
  #comment line


  Scenario: a scenario`,
            [generateProblem({ line: 5, column: 3 }, 2)],
        ],
        [
            "without Rule: description - Scenario tags and comments",
            `Feature: a feature file
  feture description here

  @tag1

  #comment line

  @tag2
  Scenario: a scenario`,
            [generateProblem({ line: 9, column: 3 }, 3)],
        ],
        [
            "without Rule: Background - Scenario tags and comments",
            `Feature: a feature file
  feture description here

  Background: a background
    describe a background
  @tag1
  #comment line
  @tag2
  Scenario: a scenario`,
            [generateProblem({ line: 9, column: 3 }, 0)],
        ],
        [
            "Step datatable",
            `Feature: a feature file
  Background: a background
    Given a step
      | data1 |
      | data2 |
  Scenario: a scenario`,
            [generateProblem({ line: 6, column: 3 }, 0)],
        ],
        [
            "Step docstring",
            `Feature: a feature file
  Background: a background
    Given a step
      """
      multiline
      content
      """


  Scenario: a scenario`,
            [generateProblem({ line: 10, column: 3 }, 2)],
        ],
        [
            "Examples table",
            `Feature: a feature file

  Scenario: a scenario
    Given a step
  Examples:
      | row1 |
      | row2 |
  Scenario: a scenario`,
            [generateProblem({ line: 8, column: 3 }, 0)],
        ],
    ];
}

module.exports = {
    generateProblem,
    getValidTestData,
    getInvalidTestData,
};
