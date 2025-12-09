const generator = require("../../../helpers/problemGenerator");
const GrammarCheck = require("../../../../lib/rules/grammar_check");

function generateProblem(location, message) {
    return generator(GrammarCheck, location, message, {
        applyFix: jest.fn(),
    });
}

function getTestData() {
    return [
        [
            "mistakes in feature name",
            "Feature: mistake,in featuere name",
            [
                generateProblem(
                    {line: 1, column: "17-18"},
                    "Use a space after a comma. Suggestions: Replace with ' '"
                ),
                generateProblem(
                    {line: 1, column: "21-29"},
                    "Did you mean to spell `featuere` this way?" +
                    " Suggestions: Replace with 'feature' OR Replace with 'feather' OR Replace with 'feathered'"
                ),
            ],
        ],
        [
            "mistakes in feature description",
            `Feature: the name is correct,
    but the user, make misstake,
 in descr,iption`,
            [
                generateProblem(
                    {line: 2, column: "24-32"},
                    "Did you mean to spell `misstake` this way?" +
                    " Suggestions: Replace with 'mistake' OR Replace with 'misstate' OR Replace with 'mistaken'"
                ),
                generateProblem(
                    {line: 3, column: "5-10"},
                    "Did you mean to spell `descr` this way?" +
                    " Suggestions: Replace with 'descry' OR Replace with 'dear' OR Replace with 'debar'"
                ),
                generateProblem(
                    {line: 3, column: "10-11"},
                    "Use a space after a comma. Suggestions: Replace with ' '"
                ),
                generateProblem(
                    {line: 3, column: "11-17"},
                    "Did you mean to spell `iption` this way?" +
                    " Suggestions: Replace with 'option' OR Replace with 'action' OR Replace with 'caption'"
                ),
            ],
        ],
        [
            "mistakes in feature comment",
            `# there can be comments at the beginning of a feature fule
Feature: the rest is correct
As a developer,
I want my feature files to be grammatically correct
So that it looks like I've paid attention in high school

    # but in these commen there are mustakes
    # also if there are multii line`,
            [
                generateProblem(
                    {line: 1, column: "55-59"},
                    "Did you mean to spell `fule` this way?" +
                    " Suggestions: Replace with 'file' OR Replace with 'flue' OR Replace with 'fuel'"
                ),
                generateProblem(
                    {line: 7, column: "20-26"},
                    "Did you mean to spell `commen` this way?" +
                    " Suggestions: Replace with 'comment' OR Replace with 'common' OR Replace with 'commend'"
                ),
                generateProblem(
                    {line: 7, column: "37-45"},
                    "Did you mean to spell `mustakes` this way?" +
                    " Suggestions: Replace with 'mistakes' OR Replace with 'mistake's' OR Replace with 'mistake'"
                ),
                generateProblem(
                    {line: 8, column: "25-31"},
                    "Did you mean to spell `multii` this way?" +
                    " Suggestions: Replace with 'multi' OR Replace with 'mufti' OR Replace with 'muftis'"
                ),
            ],
        ],
        ["mistake in Rule",
            `Feature: a feature file
  Rule: one ring to rule them alls
    Background: a background
      Given a step`,
            [
                generateProblem(
                    {line: 2, column: "31-35"},
                    "Did you mean to spell `alls` this way? Suggestions: Replace with 'alas' OR Replace with 'all's' OR Replace with 'alms'"
                ),
            ]
        ],
        ["mistake in Background",
            `Feature: a feature file
    Background: backgrounds don't have a name everytime but this one does
        Given the background of this mistake is hidden,in the dark
        And I use option "A" in stead of option "B"`,
            [
                generateProblem(
                    {line: 2, column: "47-56"},
                    "`Everytime` as a single word is proscribed." +
                    " Use `every time` instead. Suggestions: Replace with 'every time'"
                ),
                generateProblem(
                    {line: 3, column: "55-56"},
                    "Use a space after a comma. Suggestions: Replace with ' '"
                ),
                generateProblem(
                    {line: 4, column: "30-41"},
                    "Use the modern single word `instead of` to indicate a replacement." +
                    " Suggestions: Replace with 'instead of'"
                ),
            ]
        ],
        ["mistake in Background that does not have a name",
            `Feature: a feature file
    Background:
        Given the background of this mistake is hidden,in the dark
        And I use option "A" in stead of option "B"`,
            [
                generateProblem(
                    {line: 3, column: "55-56"},
                    "Use a space after a comma. Suggestions: Replace with ' '"
                ),
                generateProblem(
                    {line: 4, column: "30-41"},
                    "Use the modern single word `instead of` to indicate a replacement." +
                    " Suggestions: Replace with 'instead of'"
                ),
            ]
        ],
        ["mistake in Scenario",
            `Feature: a feature file
        Scenario: a scenarjio
        When a step
        Then a step`,
            [
                generateProblem(
                    {line: 2, column: "21-30"},
                    "Did you mean to spell `scenarjio` this way?" +
                    " Suggestions: Replace with 'scenario' OR Replace with 'scenarios'"
                ),
            ]
        ],
        ["mistake in Scenario that does not have a name",
            `Feature: a feature file
        Scenario:
        When a a scenario does not have a name.
        Then a step`,
            [
                generateProblem(
                    {line: 3, column: "14-17"},
                    "Did you mean to repeat this word? Suggestions: Replace with 'a'"
                ),
            ]
        ],
        ["mistake in Scenario Outline",
            `Feature: a feature file
        Scenario Outline: a scenario that will will run over and over again with some Examples
        When a step
        Then a step`,
            [
                generateProblem(
                    {line: 2, column: "43-52"},
                    "Two modal verbs in a row are rarely grammatical; remove one." +
                    " Suggestions: Replace with 'will' OR Replace with 'will'"
                ),
            ]
        ],
        ["mistake in Scenario Outline that does not have a name",
            `Feature: a feature file
        Scenario Outline:
        When an Scenario Outline does not have a name
        Then the linter should not crash`,
            [
                generateProblem(
                    {line: 3, column: "14-16"},
                    "Incorrect indefinite article. Suggestions: Replace with 'a'"
                ),
            ]
        ],
        ["mistake in the Examples table of Scenario Outline",
            `Feature: a feature file
        Scenario Outline: a scenario that will run over and over again with some Examples
        When the <number> is entered
        Then the <name> should be displayed
        Examples:
            | number | name  |
            | 1      | Bob   |
            | 1232   | Alice,Ben |
        `,
            [
                generateProblem(
                    {line: 8, column: "29-30"},
                    "Use a space after a comma. Suggestions: Replace with ' '"
                ),
            ]
        ],
        ["mistake in Steps",
            `Feature: a feature file
        Scenario: steps can have a lot of mistakes
        When an step has a mistake
        Then a lot of the times another one has them too`,
            [
                generateProblem(
                    {line: 3, column: "14-16"},
                    "Incorrect indefinite article. Suggestions: Replace with 'a'"
                ),
                generateProblem(
                    {line: 4, column: "27-32"},
                    "Singular `time` is usually the correct form in this context. Suggestions: Replace with 'time'"
                ),
            ]
        ],
        ["mistake in Data Table",
            `Feature: a feature file
        Scenario: steps can have a lot of mistakes
        When we check these items:
           | name  | value           |
           | itemy | some stupid tpo |
           | item  | correct value   |
           `,
            [
                generateProblem(
                    {line: 5, column: "14-19"},
                    "Did you mean to spell `itemy` this way?" +
                    " Suggestions: Replace with 'item' OR Replace with 'items' OR Replace with 'idem'"
                ),
                generateProblem(
                    {line: 5, column: "34-37"},
                    "Did you mean to spell `tpo` this way?" +
                    " Suggestions: Replace with 'tho' OR Replace with 'to' OR Replace with 'too'"
                ),
            ]
        ],
        ["mistake in doc string",
            `Feature: a feature file
        Scenario: steps can have a lot of mistakes
        Given a blog post named "Random" with Markdown body
          """
          Some Title,Eh?
          ===============
          Here is the first paragraph of my state of art blog post.
          """
           `,
            [
                generateProblem(
                    {line: 5, column: "21-22"},
                    "Use a space after a comma. Suggestions: Replace with ' '"
                ),
                generateProblem(
                    {line: 7, column: "45-57"},
                    "Did you mean `state of the art`? Suggestions: Replace with 'state of the art'"
                ),
            ]
        ],
        [
            "no mistakes in a long Scenario",
            `Feature: Opening Breakout Rooms in the Meeting Room.
  Rule: no grammar mistakes allowed
    Scenario: Meeting Room, As Moderator Create Breakout Rooms Moderator sidebar tool
      Given "Alice" has logged in
      When "Alice" starts an ad-hoc meeting and joins the meeting as moderator
      And "Alice" opens the Breakout Rooms moderator tool
      Then the "heading" in the open moderator tool for "Alice" should be "Breakout-Rooms"
      And these settings should be set in the Breakout Rooms moderator tool for "Alice"
        | setting             | value          |
        | Duration            | Unlimited Time |
        | By number of        | Rooms          |
        | Number of rooms     | 2              |
        | Random distribution | disabled       |
      And 2 rooms to be created should be displayed in the Breakout Rooms moderator tool for "Alice"
      And a "Start rooms" button should be displayed in the Breakout Rooms moderator tool for "Alice"
      And the "By number of" setting in the Breakout Rooms moderator tool for "Alice" should have these options:
        | Rooms        |
        | Participants |

    Scenario Outline: create different meeting types
    Given "Bob" has logged in
    And "Bob" has created a <meeting-type> meeting with the title "bob1"
    And "Bob" has invited "Alice" to meeting "bob1"
    And "Bob" has written this text in the chat:
    """
    Hi, I'm Bob.
    Love to be here with you.
    """
    And "Alice" has logged in
    And "Alice" has accepted the invitation for the meeting with the title "bob1" created by "Bob"
    And "Alice" has created a <meeting-type> meeting with the title "ali1"
    Examples:
      | meeting-type |
      | unscheduled  |
      | scheduled    |
        `,
            []
        ]
    ];
}

module.exports = {
    generateProblem,
    getTestData,
};
