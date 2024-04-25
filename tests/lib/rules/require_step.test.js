const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
} = require("../../__fixtures__/Rules/require_step/fixture");
const RequireScenario = require("../../../lib/rules/require_step");

const config = {
    type: "error",
};

describe("require_step", () => {
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

    describe("scenario with step", () => {
        const testData = getValidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = RequireScenario.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("scenario without step", () => {
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
