const {
    getValidTestData,
    getInvalidTestData,
    getTestDataWithFix,
    generateProblem,
} = require("../../__fixtures__/Rules/indentation/fixture");
const Indentation = require("../../../lib/rules/indentation");
const parser = require("../../helpers/parser");

const config = {
    type: "error",
    option: [2],
};

describe("Indentation rule", () => {
    describe("invalid ast", () => {
        it.each([[undefined], [null], [""], [{}]])(
            "'%s': should return undefined",
            (ast) => {
                const problems = Indentation.run(ast, config);
                expect(problems).toEqual([]);
            }
        );
    });

    describe("valid indentation", () => {
        const testData = getValidTestData();

        it.each(testData)("check indent: %s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = Indentation.run(ast, config);
            expect(problems.length).toEqual(expectedProblems.length);
            expect(problems).toEqual(expectedProblems);
        });
    });

    describe("invalid indentation", () => {
        const testData = getInvalidTestData().filter(
            (test) => test[4] !== true // get test data except docstring
        );

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = Indentation.run(ast, config);

            expect(problems.length).toEqual(expectedProblems.length);
            problems.forEach((problem, index) => {
                expect(problem.location).toEqual(
                    expectedProblems[index].location
                );
                expect(problem.message).toEqual(
                    expectedProblems[index].message
                );

                expect(problem.applyFix).toBeInstanceOf(Function);
                expect(problem.fixData).toMatchObject(
                    expectedProblems[index].fixData
                );
            });
        });

        describe("DocString", () => {
            const testData = getInvalidTestData().filter(
                (test) => test[4] === true // get all docstring test data
            );
            testData.forEach((test, index) => {
                // first test case passes
                if (index === 0) {
                    it(test[0], () => {
                        const ast = parser.parse(test[1]);
                        const problems = Indentation.run(ast, config);

                        expect(problems.length).toEqual(test[2].length);
                        problems.forEach((problem, index) => {
                            expect(problem.location).toEqual(
                                test[2][index].location
                            );
                            expect(problem.message).toEqual(
                                test[2][index].message
                            );
                            expect(problem.applyFix).toBeInstanceOf(Function);
                            expect(problem.fixData.indent).toEqual(
                                test[2][index].fixData.indent
                            );
                            expect(problem.fixData.ast).toHaveProperty(
                                "content"
                            );
                            expect(problem.fixData.ast).toHaveProperty(
                                "delimiter"
                            );
                        });
                    });
                } else {
                    // TODO: after the issue is fixed, remove the if-block
                    // https://github.com/gherlint/gherlint/issues/19
                    it.failing(test[0], () => {
                        const ast = parser.parse(test[1]);
                        const problems = Indentation.run(ast, config);

                        expect(problems.length).toEqual(test[2].length);
                        problems.forEach((problem, index) => {
                            expect(problem.location).toEqual(
                                test[2][index].location
                            );
                            expect(problem.message).toEqual(
                                test[2][index].message
                            );
                            expect(problem.applyFix).toBeInstanceOf(Function);
                            expect(problem.fixData.indent).toEqual(
                                test[2][index].fixData.indent
                            );
                            expect(problem.fixData.ast).toHaveProperty(
                                "content"
                            );
                            expect(problem.fixData.ast).toHaveProperty(
                                "delimiter"
                            );
                        });
                    });
                }
            });
        });
    });

    describe("method: fixSingleLine", () => {
        const testData = getTestDataWithFix();

        it.each(testData)(
            "apply fix: %s",
            (_, text, problem, expectedFixedText) => {
                const rule = new Indentation({}, config);
                const fixedText = rule.fixSingleLine(text, problem);

                expect(fixedText).toEqual(expectedFixedText);
            }
        );
    });

    describe("method: fixMultiLine", () => {
        const testData = getTestDataWithFix(true);

        it.each(testData)(
            "apply fix: %s",
            (_, text, problem, expectedFixedText) => {
                const rule = new Indentation({}, config);
                const fixedText = rule.fixMultiLine(text, problem);

                expect(fixedText).toEqual(expectedFixedText);
            }
        );
    });

    describe("custom indentation requirement", () => {
        const customConfig = {
            type: "error",
            option: [4],
        };
        it.each([
            [
                "less indentation",
                "Feature: a feature\n  Scenario: a scenario",
                [
                    generateProblem(
                        { line: 2, column: 3 },
                        customConfig.option[0],
                        2
                    ),
                ],
            ],
            [
                "more indentation",
                "Feature: a feature\n      Scenario: a scenario\n   Given a step",
                [
                    generateProblem(
                        { line: 2, column: 7 },
                        customConfig.option[0],
                        6
                    ),
                    generateProblem(
                        { line: 3, column: 4 },
                        customConfig.option[0] * 2,
                        3
                    ),
                ],
            ],
        ])("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = Indentation.run(ast, customConfig);
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
