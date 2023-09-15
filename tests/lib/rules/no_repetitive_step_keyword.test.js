const parser = require("../../helpers/parser");
const {
    getValidTestData,
    getInvalidTestDataWithFix,
} = require("../../__fixtures__/Rules/no_repetitive_step_keyword/fixture");
const NoRepetitiveSteps = require("../../../lib/rules/no_repetitive_step_keyword");

const config = {
    type: "error",
};

describe("no_repetitive_step_keyword", () => {
    describe("invalid ast", () => {
        it.each([[undefined], [null], [""], [{}]])(
            "%s: should return undefined",
            (ast) => {
                const problems = NoRepetitiveSteps.run(ast);
                expect(problems).toEqual([]);
            }
        );
    });

    describe("no step repetition", () => {
        const testData = getValidTestData();

        it.each(testData)("%s: ", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = NoRepetitiveSteps.run(ast, config);
            expect(problems).toEqual(expectedProblems);
            expect(problems.length).toEqual(0);
        });
    });

    describe("step repetition", () => {
        const testData = getInvalidTestDataWithFix();

        describe("without fix option", () => {
            it.each(testData)("%s: ", (_, text, expectedProblems) => {
                const ast = parser.parse(text);
                const problems = NoRepetitiveSteps.run(ast, config);
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
});
