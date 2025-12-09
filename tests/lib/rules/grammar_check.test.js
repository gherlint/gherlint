const {
    getTestData,
} = require("../../__fixtures__/Rules/grammar_check/fixture");
const GrammarCheck = require("../../../lib/rules/grammar_check");
const {Linter} = require("../../../lib/linter");

let config = {
    type: "error",
};

describe("Grammar rule", () => {

    describe("config", () => {
        test("the default dialect is British English", async () => {
            const linter = new Linter();
            const ast = linter.parseAst("Feature: a beautiful colour with a nice flavour");
            const problems = await GrammarCheck.run(ast, config);

            expect(problems.length).toEqual(0);
        });
        test("set dialect to American", async () => {
            config = {
                type: "error",
                option: ["American"],
            };
            const linter = new Linter();
            const ast = linter.parseAst("Feature: a beautiful colour with a nice flavour");
            const problems = await GrammarCheck.run(ast, config);

            expect(problems.length).toEqual(2);
        });
        test("extra words in dictionary", async () => {
            config = {
                type: "error",
                option: ["", ["JankariTech", "GmbH", "Badal"]],
            };
            const linter = new Linter();
            const ast = linter.parseAst("Feature: unknown words: JankariTech, GmbH, Badal");
            const problems = await GrammarCheck.run(ast, config);

            expect(problems.length).toEqual(0);
        });
        test("disable some rules but leave others active", async () => {
            config = {
                type: "error",
                option: ["", [], {
                    ExpandMinimum: false,
                    CanBeSeen: false,
                }],
            };
            const linter = new Linter();
            const ast = linter.parseAst(
                `Feature: it can be seem that 'min' is expanded
This tool can be piggy bag`
            );
            const problems = await GrammarCheck.run(ast, config);

            expect(problems.length).toEqual(1);
            expect(problems[0].message).toBe("Did you mean `piggyback`? Suggestions: Replace with 'piggyback'");
        });
        test("replace strings", async () => {
            config = {
                type: "error",
                option: [
                    "",
                    [],
                    {},
                    [
                        ["\\n", " "],
                        ["~", ""],
                    ]
                ],
            };
            const linter = new Linter();
            const ast = linter.parseAst(
                `Feature: steps can have special characters
  Scenario: step with line break
    When a step contains "a\\nline break"
    And a step contains spec~ial characters`
            );
            const problems = await GrammarCheck.run(ast, config);

            expect(problems.length).toEqual(0);
        });
    });

    describe("invalid ast", () => {
        it.each([[undefined], [null], [""], [{}]])(
            "'%s': should return undefined",
            async (ast) => {
                const problems = await GrammarCheck.run(ast, config);
                expect(problems).toEqual([]);
            }
        );
    });

    describe("grammar checks", () => {
        const testData = getTestData();

        it.each(testData)("%s", async (_, text, expectedProblems) => {
            const linter = new Linter();
            const ast = linter.parseAst(text);
            const problems = await GrammarCheck.run(ast, config);

            expect(problems.length).toEqual(expectedProblems.length);
            problems.forEach((problem, index) => {
                expect(problem.location).toEqual(
                    expectedProblems[index].location
                );
                expect(problem.message).toEqual(
                    expectedProblems[index].message
                );
            });
        });
    });
});
