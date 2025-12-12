const generator = require("../../../helpers/problemGenerator");
const WordsToAvoid = require("../../../../lib/rules/words_to_avoid");

function generateProblem(location, message) {
    return generator(WordsToAvoid, location, message, {
        applyFix: jest.fn(),
    });
}

function getTestData() {
    return [
        [
            "no step",
            `Feature: WordsToAvoid
  Scenario: without any step`,
            [
            ],
        ],
        [
            "all steps correct",
            `Feature: WordsToAvoid
  Scenario: without any word to avoid
    Given a feature does have a Then step
    When the user runs the 'WordsToAvoid' rule
    And every step is correct
    Then no error should be shown`,
            [
            ],
        ],
        [
            "given step contains a word to avoid",
            `Feature: WordsToAvoid
  Scenario: with a Given step that contains one of the bad words
    Given a given step contains the word sees
    And that word is to be avoided
    When the user runs the 'WordsToAvoid' rule
    Then an error should be thrown`,
            [
                generateProblem(
                    {line: 3, column: 42},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "given step in background contains a word to avoid",
            `Feature: WordsToAvoid
  Background: with a Given step that contains one of the bad words
    Given a given step contains the word sees
    And that word is to be avoided

  Scenario:
    When the user runs the 'WordsToAvoid' rule
    Then an error should be thrown`,
            [
                generateProblem(
                    {line: 3, column: 42},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "when step contains a word to avoid",
            `Feature: WordsToAvoid
  Scenario: with a Then step that contains one of the bad words
    Given a when step contains a bad word
    When the linter sees the word
    Then an error should be thrown`,
            [
                generateProblem(
                    {line: 4, column: 21},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "and step contains a word to avoid",
            `Feature: WordsToAvoid
  Scenario: with a Then step that contains one of the bad words
    Given a And step contains a bad word
    When the user runs the 'WordsToAvoid' rule
    And the linter sees the word
    Then an error should be thrown`,
            [
                generateProblem(
                    {line: 5, column: 20},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "then step contains a word to avoid",
            `Feature: WordsToAvoid
  Scenario: with a Then step that contains one of the bad words
    Given a feature does have a Then step
    And the Then step does contain a bad words
    When the user runs the 'WordsToAvoid' rule
    Then the user sees an error`,
            [
                generateProblem(
                    {line: 6, column: 19},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "multiple steps, each contains one word to avoid",
            `Feature: WordsToAvoid
  Scenario: multiple steps, each contains one word to avoid
    Given a feature does have a lot of steps
    When the user uses the word clicks
    And also the word "sees"
    Then the user should sees an error`,
            [
                generateProblem(
                    {line: 4, column: 33},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 5, column: 24},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 6, column: 26},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "multiple steps, each contains multiple words to avoid",
            `Feature: WordsToAvoid
  Scenario: multiple steps, each contains one word to avoid
    Given a feature does have a lot of steps
    When the user sees and clicks
    And also clicks and "sees" & sees & clicks
    Then the user should sees an error and clicks it and clicks it & sees`,
            [
                generateProblem(
                    {line: 4, column: 19},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 4, column: 28},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 5, column: 14},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 5, column: 26},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 5, column: 34},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 5, column: 41},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 6, column: 26},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 6, column: 44},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 6, column: 58},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 6, column: 70},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "words to avoid in different quotes",
            `Feature: WordsToAvoid
  Scenario: multiple steps, each contains one word to avoid in quotes
    Given a feature does have a lot of steps
    When the user uses the word 'clicks'
    And also the word "sees"
    And also the word 'sees"
    And also the word ”clicks"
    And also the word ”clicks”
    And also the word ”clicks“ in other quotes
    Then the user should “sees“ an error`,
            [
                generateProblem(
                    {line: 4, column: 34},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 5, column: 24},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 6, column: 24},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 7, column: 24},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 8, column: 24},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 9, column: 24},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 10, column: 27},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
            ],
        ],
        [
            "words to avoid in different positions in the sentence",
            `Feature: WordsToAvoid
  Scenario: multiple steps, each contains one word to avoid
    Given sees a feature does have a lot of steps
    When the user uses the word 'clicks
    And the user uses the word clicks
    And "sees also the word sees
    And sees also the word clicks`,
            [
                generateProblem(
                    {line: 3, column: 11},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 4, column: 34},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 5, column: 32},
                    "Do not use the word 'clicks'."
                ),
                generateProblem(
                    {line: 6, column: 10},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 6, column: 29},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 7, column: 9},
                    "Do not use the word 'sees'. Describe how the app behaves, not what the user sees."
                ),
                generateProblem(
                    {line: 7, column: 28},
                    "Do not use the word 'clicks'."
                ),
            ],
        ],
        [
            "words to avoid are only a part of another word",
            `Feature: WordsToAvoid
  Scenario: multiple steps, each contains one word to avoid as part of another
    Given addressees a feature does have a lot of steps
    When the user uses the word 'indorsees
    And the user uses the word recognisees
    And the user recognisees the word
    And the user seeseessees also the word`,
            [
            ],
        ],
        [
            "words to avoid in other parts of the feature file => no error",
            `Feature: WordsToAvoid click here
 As a user who sees this feature
 I Do not want to see any words to be avoided

  Background: the name can also contain bad words like see
    Given the steps Do not

  Scenario: that has a word to avoid in the name - sees no error
    Given a feature does have a lot of steps
    # and also I see some comments
    When the user runs the 'WordsToAvoid' rule
    And every step is correct
    Then no error should be shown

  Scenario Outline: can also contain bad words like click
    Given the steps Do not
    Examples:
    |A|
    |B|`,
            [
            ],
        ],
    ];
}

module.exports = {
    generateProblem,
    getTestData,
};
