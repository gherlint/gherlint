const {
    getInvalidTestData,
} = require("../../__fixtures__/Rules/grammar_check/fixture");
const GrammarCheck = require("../../../lib/rules/grammar_check");
const parser = require("../../helpers/parser");

const config = {
    type: "error",
    option: [2],
};

describe("Grammar rule", () => {
    describe("invalid ast", () => {
        it.each([[undefined], [null], [""], [{}]])(
            "'%s': should return undefined",
            async (ast) => {
                const problems = await GrammarCheck.run(ast, config);
                expect(problems).toEqual([]);
            }
        );
    });

    // describe("valid indentation", () => {
    //     const testData = getValidTestData();
    //
    //     it.each(testData)("check indent: %s", (_, text, expectedProblems) => {
    //         const ast = parser.parse(text);
    //         const problems = Indentation.run(ast, config);
    //         expect(problems.length).toEqual(expectedProblems.length);
    //         expect(problems).toEqual(expectedProblems);
    //     });
    // });

    describe("grammar mistakes", () => {
        const testData = getInvalidTestData();

        it.each(testData)("%s", async (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const problems = await GrammarCheck.run(ast, config);

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
});
