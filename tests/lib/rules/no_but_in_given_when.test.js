const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
} = require("../../__fixtures__/Rules/no_but_in_given_when/fixture");
const NoButInGivenWhen = require("../../../lib/rules/no_but_in_given_when");

const config = {
    type: "warn",
};

describe("no_but_in_given_when", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = NoButInGivenWhen.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("Valid: No But in Given or When step", () => {
        const testData = getValidTestData();

        it.each(testData)("%s: ", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NoButInGivenWhen.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("Invalid: But in Given or When step", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NoButInGivenWhen.run(ast, config);
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
