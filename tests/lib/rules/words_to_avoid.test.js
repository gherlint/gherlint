const {
    getTestData,
} = require("../../__fixtures__/Rules/words_to_avoid/fixture");
const WordsToAvoid = require("../../../lib/rules/words_to_avoid");
const {Linter} = require("../../../lib/linter");

describe("Words To Avoid rule", () => {

    describe("config", () => {
        test("empty list",  () => {
            const config = {
                type: "error",
            };
            const linter = new Linter();
            const ast = linter.parseAst("Feature: \nScenario: empty list\nWhen there is nothing in the list");
            const problems = WordsToAvoid.run(ast, config);

            expect(problems.length).toEqual(0);
        });
        test("list with one item, but without an error message", () => {
            const config = {
                type: "error",
                option: [[["seen"]]],
            };
            const linter = new Linter();
            const ast = linter.parseAst("Feature: \nScenario: empty list\nWhen there is no error in the list\nBut a bad word seen");
            const problems = WordsToAvoid.run(ast, config);

            expect(problems.length).toEqual(1);
            expect(problems[0].message).toEqual("Do not use the word 'seen'.");
        });
        test("list with multiple items, but without an error message",  () => {
            const config = {
                type: "error",
                option: [[["seen"], ["list"]]],
            };
            const linter = new Linter();
            const ast = linter.parseAst("Feature: \nScenario: empty list\nWhen there is no error in the list\nBut a bad word seen");
            const problems = WordsToAvoid.run(ast, config);

            expect(problems.length).toEqual(2);
            expect(problems[0].message).toEqual("Do not use the word 'list'.");
            expect(problems[1].message).toEqual("Do not use the word 'seen'.");
        });
        test("list with multiple items, but only one with an error message",  () => {
            const config = {
                type: "error",
                option: [[["seen", "Describe how the app behaves, not what the user sees."], ["list"]]],
            };
            const linter = new Linter();
            const ast = linter.parseAst("Feature: \nScenario: empty list\nWhen there is no error in the list\nBut a bad word seen");
            const problems =  WordsToAvoid.run(ast, config);

            expect(problems.length).toEqual(2);
            expect(problems[0].message).toEqual("Do not use the word 'list'.");
            expect(problems[1].message).toEqual("Do not use the word 'seen'. Describe how the app behaves, not what the user sees.");
        });

    });

    describe("invalid ast", () => {
        const config = {
            type: "error",
        };
        it.each([[undefined], [null], [""], [{}]])(
            "'%s': should return undefined",
            (ast) => {
                const problems = WordsToAvoid.run(ast, config);
                expect(problems).toEqual([]);
            }
        );
    });

    describe("different cases using words 'sees' and 'clicks'", () => {
        const config = {
            type: "error",
            option: [[["sees", "Describe how the app behaves, not what the user sees."], ["clicks"]]],
        };
        const testData = getTestData();

        it.each(testData)("%s", (_, text, expectedProblems) => {
            const linter = new Linter();
            const ast = linter.parseAst(text);
            const problems = WordsToAvoid.run(ast, config);

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
