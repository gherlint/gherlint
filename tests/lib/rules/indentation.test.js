const { format } = require("util");

const { Indentation, run } = require("../../../lib/rules/indentation");
const parser = require("../helpers/parser");

const config = {
    rules: {
        indentation: ["warn", 4],
    },
    cliOptions: {},
};

describe("Indentation rule", () => {
    describe("main function: run()", () => {
        describe("empty ast", () => {
            it("empty args: should return undefined", () => {
                expect(run()).toBeUndefined();
            });
            it("empty ast object: should return undefined", () => {
                expect(run({})).toBeUndefined();
            });
        });

        describe("without fix option", () => {
            it.each([
                [
                    "valid indentation (with Rule)",
                    `@tag1
Feature: a feature file
As a user
I want
So that
    @tag1
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
                    "valid indentation",
                    `@tag1
Feature: a feature file
As a user
I want
So that
    Background: a background
        Given a step
    @tag2
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
                [
                    "invalid tag indentation",
                    ` @tag1
Feature: a feature file`,
                    [generateProblem({ line: 1, column: 2 }, 0, 1, config)],
                ],
                [
                    "invalid Feature indentation",
                    "   Feature: a feature file",
                    [generateProblem({ line: 1, column: 4 }, 0, 3, config)],
                ],
                [
                    "invalid Rule indentation",
                    `Feature: a feature file
Rule: a rule
  Rule: a rule
        Rule: a rule`,
                    [
                        // no indent
                        generateProblem({ line: 2, column: 1 }, 4, 0, config),
                        // less indent
                        generateProblem({ line: 3, column: 3 }, 4, 2, config),
                        // more indent
                        generateProblem({ line: 4, column: 9 }, 4, 8, config),
                    ],
                ],
                [
                    "invalid Background indentation (no indent)",
                    `Feature: a feature file
Background: a background`,
                    [generateProblem({ line: 2, column: 1 }, 4, 0, config)],
                ],
                [
                    "invalid Background indentation (less indent)",
                    `Feature: a feature file
  Background: a background`,
                    [generateProblem({ line: 2, column: 3 }, 4, 2, config)],
                ],
                [
                    "invalid Background indentation (more indent)",
                    `Feature: a feature file
        Background: a background`,
                    [generateProblem({ line: 2, column: 9 }, 4, 8, config)],
                ],
                [
                    "invalid Background Step indentation (no indent)",
                    `Feature: a feature file
    Background: a background
Given a step`,
                    [generateProblem({ line: 3, column: 1 }, 8, 0, config)],
                ],
                [
                    "invalid Background Step indentation (less indent)",
                    `Feature: a feature file
    Background: a background
    Given a step`,
                    [generateProblem({ line: 3, column: 5 }, 8, 4, config)],
                ],
                [
                    "invalid Background Step indentation (more indent)",
                    `Feature: a feature file
    Background: a background
            Given a step`,
                    [generateProblem({ line: 3, column: 13 }, 8, 12, config)],
                ],
                [
                    "invalid Scenario indentation",
                    `Feature: a feature file
Scenario: a scenario
  Scenario: a scenario
        Scenario: a scenario`,
                    [
                        // no indent
                        generateProblem({ line: 2, column: 1 }, 4, 0, config),
                        // less indent
                        generateProblem({ line: 3, column: 3 }, 4, 2, config),
                        // more indent
                        generateProblem({ line: 4, column: 9 }, 4, 8, config),
                    ],
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
                        generateProblem({ line: 2, column: 1 }, 4, 0, config),
                        // less indent
                        generateProblem({ line: 4, column: 3 }, 4, 2, config),
                        // more indent
                        generateProblem({ line: 6, column: 9 }, 4, 8, config),
                    ],
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
                        generateProblem({ line: 3, column: 1 }, 8, 0, config),
                        // less indent
                        generateProblem({ line: 5, column: 5 }, 8, 4, config),
                        // more indent
                        generateProblem({ line: 7, column: 13 }, 8, 12, config),
                    ],
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
                        generateProblem({ line: 4, column: 1 }, 12, 0, config),
                        // less indent
                        generateProblem({ line: 5, column: 5 }, 12, 4, config),
                        // more indent
                        generateProblem(
                            { line: 6, column: 17 },
                            12,
                            16,
                            config
                        ),
                    ],
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
                        generateProblem({ line: 4, column: 1 }, 12, 0, config),
                        // less indent
                        generateProblem({ line: 8, column: 9 }, 12, 8, config),
                        // more indent
                        generateProblem(
                            { line: 12, column: 17 },
                            12,
                            16,
                            config
                        ),
                    ],
                ],
                [
                    "invalid Scenario Outline indentation",
                    `Feature: a feature file
Scenario Outline: a scenario
  Scenario Outline: a scenario
        Scenario Outline: a scenario`,
                    [
                        // no indent
                        generateProblem({ line: 2, column: 1 }, 4, 0, config),
                        // less indent
                        generateProblem({ line: 3, column: 3 }, 4, 2, config),
                        // more indent
                        generateProblem({ line: 4, column: 9 }, 4, 8, config),
                    ],
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
                        generateProblem({ line: 3, column: 1 }, 8, 0, config),
                        // less indent
                        generateProblem({ line: 5, column: 5 }, 8, 4, config),
                        // more indent
                        generateProblem({ line: 7, column: 13 }, 8, 12, config),
                    ],
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
                        generateProblem({ line: 3, column: 1 }, 8, 0, config),
                        // less indent
                        generateProblem({ line: 6, column: 5 }, 8, 4, config),
                        // more indent
                        generateProblem({ line: 9, column: 13 }, 8, 12, config),
                    ],
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
                        generateProblem({ line: 4, column: 1 }, 12, 0, config),
                        // less indent
                        generateProblem({ line: 5, column: 9 }, 12, 8, config),
                        // more indent
                        generateProblem(
                            { line: 6, column: 17 },
                            12,
                            16,
                            config
                        ),
                    ],
                ],
            ])("check indent: %s", (_, text, problems) => {
                const ast = parser.parse(text);

                const ruleProblems = run(ast, config);

                expect(ruleProblems.length).toEqual(problems.length);
                expect(new Set(ruleProblems)).toEqual(new Set(problems));
            });

            describe("Expected to fail", () => {
                it.failing("Rule tags: yet to implement", () => {
                    const text = `Feature: a feature file
    @tag1
        Rule: a rule
        @tag2
        Rule: a rule
            @tag2
        Rule: a rule`;
                    const ast = parser.parse(text);
                    const problems = [
                        // no indent
                        generateProblem({ line: 2, column: 1 }, 4, 0, config),
                        // less indent
                        generateProblem({ line: 4, column: 3 }, 4, 2, config),
                        // more indent
                        generateProblem({ line: 6, column: 9 }, 4, 8, config),
                    ];

                    const ruleProblems = run(ast, config);

                    expect(ruleProblems.length).toEqual(problems.length);
                    expect(new Set(ruleProblems)).toEqual(new Set(problems));
                });
            });
        });
    });
});

function generateProblem(location, expectedIndent, actualIndent, config) {
    let fixProps = {};
    if (config.cliOptions.fix) {
        fixProps = {
            fixData: {
                replaceBy: " ".repeat(expectedIndent),
                replaceTo: " ".repeat(actualIndent),
            },
            applyFix: jest.fn(),
        };
    }

    return {
        ...Indentation.meta,
        location,
        message: format(Indentation.meta.message, expectedIndent, actualIndent),
        ...fixProps,
    };
}
