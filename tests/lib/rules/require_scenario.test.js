const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
} = require("../../__fixtures__/Rules/require_scenario/fixture");
const RequireScenario = require("../../../lib/rules/require_scenario");

const config = {
    type: "error",
};

describe("require_scenario", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = RequireScenario.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("with a scenario", () => {
        const testData = getValidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = RequireScenario.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("without a scenario", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = RequireScenario.run(ast, config);
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
