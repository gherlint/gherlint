const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
} = require("../../__fixtures__/Rules/require_when_step/fixture");
const RequireWhenStep = require("../../../lib/rules/require_when_step");

const config = {
    type: "error",
};

describe("require_when_step", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = RequireWhenStep.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("Valid: Require when step", () => {
        const testData = getValidTestData();

        it.each(testData)("%s: ", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = RequireWhenStep.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("Invalid: When is missing a step", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = RequireWhenStep.run(ast, config);
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
