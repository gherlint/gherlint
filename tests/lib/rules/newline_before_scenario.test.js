const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
    generateProblem,
} = require("../../__fixtures__/Rules/newline_before_scenario/fixture");
const NewlineBeforeScenario = require("../../../lib/rules/newline_before_scenario");

const config = {
    type: "error",
    option: [],
};

describe("newline_before_scenario", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = NewlineBeforeScenario.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("valid data:", () => {
        const testData = getValidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NewlineBeforeScenario.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("invalid data:", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NewlineBeforeScenario.run(ast, config);
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

    describe("custom newline requirement", () => {
        const customConfig = {
            type: "error",
            option: [2],
        };
        it.each([
            [
                "less newlines",
                "Feature: a feature\n  Scenario: a scenario",
                [
                    generateProblem(
                        { line: 2, column: 3 },
                        0,
                        customConfig.option[0]
                    ),
                ],
            ],
            [
                "more newlines",
                "Feature: a feature\n\n\n\n  Scenario: a scenario",
                [
                    generateProblem(
                        { line: 5, column: 3 },
                        3,
                        customConfig.option[0]
                    ),
                ],
            ],
        ])("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NewlineBeforeScenario.run(ast, customConfig);
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
