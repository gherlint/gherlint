const {
    getTestData,
} = require("../../__fixtures__/Rules/then_should_have_should/fixture");
const ThenShouldHavaShould = require("../../../lib/rules/then_should_have_should");
const {Linter} = require("../../../lib/linter");

let config = {
    type: "error",
};

describe("Then should have should", () => {

    describe("invalid ast", () => {
        it.each([[undefined], [null], [""], [{}]])(
            "'%s': should return undefined",
            async (ast) => {
                const problems = await ThenShouldHavaShould.run(ast, config);
                expect(problems).toEqual([]);
            }
        );
    });

    describe("then should have a 'should'", () => {
        const testData = getTestData();

        it.each(testData)("%s", async (_, text, expectedProblems) => {
            const linter = new Linter();
            const ast = linter.parseAst(text);
            const problems = await ThenShouldHavaShould.run(ast, config);

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
