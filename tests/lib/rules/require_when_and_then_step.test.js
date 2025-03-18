const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
} = require("../../__fixtures__/Rules/require_when_and_then_step/fixture");
const RequireWhenAndThenStep = require("../../../lib/rules/require_when_and_then_step");

const config = {
    type: "warn",
};

describe("require_when_and_then_step", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = RequireWhenAndThenStep.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("Valid: Require when and then step", () => {
        const testData = getValidTestData();

        it.each(testData)("%s: ", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = RequireWhenAndThenStep.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("Invalid: When and Then is missing a step", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            ast.text = text;
            const problems = RequireWhenAndThenStep.run(ast, config);
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
