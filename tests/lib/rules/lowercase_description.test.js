const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
    getInvalidTestDataWithFix,
} = require("../../__fixtures__/Rules/lowercase_description/fixture");
const LowercaseDescription = require("../../../lib/rules/lowercase_description");

const config = {
    type: "off",
};

describe("lowercase_description", () => {
    describe("invalid ast", () => {
        it.each([
            ["undefined", undefined],
            ["null", null],
            ["string", ""],
            ["empty object", {}],
        ])("%s: should not show any lint problems", (_, ast) => {
            const problems = LowercaseDescription.run(ast);
            expect(problems).toEqual([]);
        });
    });

    describe("with a lowercase description", () => {
        const testData = getValidTestData();
        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            ast.text = text;
            const problems = LowercaseDescription.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("with a uppercase description", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            ast.text = text;
            const problems = LowercaseDescription.run(ast, config);
            expect(problems.length).toEqual(expectedProblems.length);
            problems.forEach((problem, index) => {
                expect(problem.location).toEqual(
                    expectedProblems[index].location
                );
                expect(problem.message).toEqual(
                    expectedProblems[index].message
                );
                expect(problem.applyFix).toBeInstanceOf(Function);
            });
        });
    });

    describe("method: fixLowercase description", () => {
        const testData = getInvalidTestDataWithFix();
        it.each(testData)("%s", (_, text, problem, expectedFixedText) => {
            const fixedText = LowercaseDescription.fixLowercaseDescription(
                text,
                problem
            );
            expect(fixedText).toEqual(expectedFixedText);
        });
    });
});
