const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestData,
    getInvalidTestDataWithFix,
} = require("../../__fixtures__/Rules/no_repetitive_step_keyword/fixture");
const NoRepetitiveStepKeyword = require("../../../lib/rules/no_repetitive_step_keyword");

const config = {
    type: "error",
};

describe("no_repetitive_step_keyword", () => {
    describe("invalid ast", () => {
        it.each([[undefined], [null], [""], [{}]])(
            "%s: should return undefined",
            (ast) => {
                const problems = NoRepetitiveStepKeyword.run(ast);
                expect(problems).toEqual([]);
            }
        );
    });

    describe("no step repetition", () => {
        const testData = getValidTestData();

        it.each(testData)("%s: ", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NoRepetitiveStepKeyword.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("step repetition", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s: ", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NoRepetitiveStepKeyword.run(ast, config);
            expect(problems.length).toEqual(expectedProblems.length);
            problems.forEach((problem, index) => {
                expect(problem.location).toEqual(
                    expectedProblems[index].location
                );
                expect(problem.message).toEqual(
                    expectedProblems[index].message
                );
                expect(problem.applyFix).toBeInstanceOf(Function);
                expect(problem.fixData).toMatchObject(
                    expectedProblems[index].fixData
                );
            });
        });
    });

    describe("method: fixRepetition", () => {
        const testData = getInvalidTestDataWithFix();

        it.each(testData)("%s: ", (_, text, problem, expectedFixedText) => {
            const rule = new NoRepetitiveStepKeyword();
            const fixedText = rule.fixRepetition(text, problem);
            expect(fixedText).toEqual(expectedFixedText);
        });
    });
});
