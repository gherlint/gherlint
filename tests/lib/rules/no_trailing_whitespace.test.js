const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
    getInvalidTestDataWithFix,
} = require("../../__fixtures__/Rules/no_trailing_whitespace/fixture");
const NoTrailingWhitespace = require("../../../lib/rules/no_trailing_whitespace");

const config = {
    type: "error",
};

describe("no_trailing_whitespace", () => {
    describe("no trailing whitespaces", () => {
        const testData = getValidTestData();
        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            ast.text = text;
            const problems = NoTrailingWhitespace.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("some trailing whitespaces", () => {
        const testData = getInvalidTestData();
        it.each(testData)("%s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            ast.text = text;
            const problems = NoTrailingWhitespace.run(ast, config);
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

    describe("method: fixTrailingWhitespace", () => {
        const testData = getInvalidTestDataWithFix();
        it.each(testData)("%s", (_, text, problem, expectedFixedText) => {
            const fixedText = NoTrailingWhitespace.fixTrailingWhitespace(
                text,
                problem
            );
            expect(fixedText).toEqual(expectedFixedText);
        });
    });
});
