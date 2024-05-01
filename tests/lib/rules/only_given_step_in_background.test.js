const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
} = require("../../__fixtures__/Rules/only_given_step_in_background/fixture");
const OnlyGivenStepInBackground = require("../../../lib/rules/only_given_step_in_background");

const config = {
    type: "warn",
};

describe("only_given_step_in_background", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = OnlyGivenStepInBackground.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("valid: only Given steps", () => {
        const testData = getValidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = OnlyGivenStepInBackground.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("invalid: other steps", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = OnlyGivenStepInBackground.run(ast, config);
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
