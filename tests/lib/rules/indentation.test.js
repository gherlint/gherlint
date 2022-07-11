const {
    getTestData,
    generateProblem,
} = require("../../__fixtures__/Rules/indentation/testdata");
const Indentation = require("../../../lib/rules/indentation");
const parser = require("../helpers/parser");

const config = {
    rules: {
        indentation: ["warn", 4],
    },
    cliOptions: {},
};

describe("Indentation rule", () => {
    describe("empty ast", () => {
        it("empty args: should return undefined", () => {
            const rule = Indentation.run();
            expect(rule.getProblems()).toEqual([]);
        });
        it("empty ast object: should return undefined", () => {
            const rule = Indentation.run({});
            expect(rule.getProblems()).toEqual([]);
        });
    });
    describe("without fix option", () => {
        const testData = getTestData(config);

        it.each(testData)("check indent: %s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const rule = Indentation.run(ast, config);
            const problems = rule.getProblems();

            expect(problems.length).toEqual(expectedProblems.length);
            expect(new Set(problems)).toEqual(new Set(expectedProblems));
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

                const expectedProblems = [
                    // no indent
                    generateProblem({ line: 2, column: 1 }, 4, 0, config),
                    // less indent
                    generateProblem({ line: 4, column: 3 }, 4, 2, config),
                    // more indent
                    generateProblem({ line: 6, column: 9 }, 4, 8, config),
                ];

                const ast = parser.parse(text);
                const rule = Indentation.run(ast, config);
                const problems = rule.getProblems();

                expect(problems.length).toEqual(expectedProblems.length);
                expect(new Set(problems)).toEqual(new Set(expectedProblems));
            });
            it.failing("Multiline tags: yet to implement", () => {
                const text = `      @tag1
  @tag1
Feature: a feature`;

                const expectedProblems = [
                    generateProblem({ line: 1, column: 7 }, 0, 6, config),
                    generateProblem({ line: 2, column: 3 }, 0, 2, config),
                ];

                const ast = parser.parse(text);
                const rule = Indentation.run(ast, config);
                const problems = rule.getProblems();

                expect(problems.length).toEqual(expectedProblems.length);
                expect(new Set(problems)).toEqual(new Set(expectedProblems));
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

            const rule = Indentation.run(ast, configWithFix);
            const problems = rule.getProblems();

            problems.forEach((problem, index) => {
                expect(problem.fixData).toMatchObject(
                    expectedProblems[index].fixData
                );
            });
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

                const expectedProblems = [
                    // no indent
                    generateProblem(
                        { line: 2, column: 1 },
                        4,
                        0,
                        configWithFix
                    ),
                    // less indent
                    generateProblem(
                        { line: 4, column: 3 },
                        4,
                        2,
                        configWithFix
                    ),
                    // more indent
                    generateProblem(
                        { line: 6, column: 9 },
                        4,
                        8,
                        configWithFix
                    ),
                ];

                const ast = parser.parse(text);
                const rule = Indentation.run(ast, configWithFix);
                const problems = rule.getProblems();

                expect(problems.length).toEqual(expectedProblems.length);
                // ToDo: after implementing fix, remove above line
                problems.forEach((problem, index) => {
                    expect(problem.fixData).toMatchObject(
                        expectedProblems[index].fixData
                    );
                });
            });
        });
    });
});
