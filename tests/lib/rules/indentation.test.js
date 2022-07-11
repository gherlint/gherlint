const {
    getTestData,
    generateProblem,
} = require("../../__fixtures__/Rules/indentation/testdata");
const { run, Indentation } = require("../../../lib/rules/indentation");
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
    });
    describe("Indentation class", () => {
        describe("without fix option", () => {
            const testData = getTestData(config);

            it.each(testData)(
                "check indent: %s",
                (_, text, expectedProblems) => {
                    const ast = parser.parse(text);
                    const Rule = new Indentation(ast, config);
                    Rule.run();
                    const problems = Rule.getProblems();

                    expect(problems.length).toEqual(expectedProblems.length);
                    expect(new Set(problems)).toEqual(
                        new Set(expectedProblems)
                    );
                }
            );

            describe("Expected to fail", () => {
                it.failing("Rule tags: yet to implement", () => {
                    const text = `Feature: a feature file
@tag1
    Rule: a rule
  @tag2
    Rule: a rule
        @tag2
    Rule: a rule`;

                    const expectedProblems = [
                        // no indentconfig
                        generateProblem({ line: 4, column: 3 }, 4, 2, config),
                        // more indent
                        generateProblem({ line: 6, column: 9 }, 4, 8, config),
                    ];

                    const ast = parser.parse(text);
                    const Rule = new Indentation(ast, config);
                    Rule.run();
                    const problems = Rule.getProblems();

                    expect(problems.length).toEqual(expectedProblems.length);
                    expect(new Set(problems)).toEqual(
                        new Set(expectedProblems)
                    );
                });
            });
        });

        describe("with fix option", () => {
            const configWithFix = {
                ...config,
                cliOptions: { fix: true },
            };
            const testData = getTestData(configWithFix);

            it.each(testData)("check fix: %s", (_, text, expectedProblems) => {
                const ast = parser.parse(text);

                const Rule = new Indentation(ast, configWithFix);
                Rule.run();
                const problems = Rule.getProblems();

                problems.forEach((problem, index) => {
                    expect(problem.fixData).toMatchObject(
                        expectedProblems[index].fixData
                    );
                });
            });
        });
    });
});
