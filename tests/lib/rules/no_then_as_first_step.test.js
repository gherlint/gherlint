const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
} = require("../../__fixtures__/Rules/no_then_as_first_step/fixture");
const NoThenAsFirstStep = require("../../../lib/rules/no_then_as_first_step");

const config = {
    type: "warn",
};

describe("no_then_as_first_step", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = NoThenAsFirstStep.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("Valid: Given/When as first step", () => {
        const testData = getValidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NoThenAsFirstStep.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("Invalid: Then as first step", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NoThenAsFirstStep.run(ast, config);
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
