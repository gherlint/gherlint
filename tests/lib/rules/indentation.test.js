const {
    getValidTestData,
    getInvalidTestData,
    getTestDataWithFix,
} = require("../../__fixtures__/Rules/indentation/testdata");
const Indentation = require("../../../lib/rules/indentation");
const parser = require("../helpers/parser");

const config = {
    type: "warn",
    option: [2],
};

describe("Indentation rule", () => {
    describe("empty ast", () => {
        it.each([[undefined], [null], [""], [{}]])(
            "invalid ast '%s': should return undefined",
            (ast) => {
                const problems = Indentation.run(ast);
                expect(problems).toEqual([]);
            }
        );
    });

    describe("valid test data", () => {
        const testData = getValidTestData();

        it.each(testData)("check indent: %s", (_, text) => {
            const ast = parser.parse(text);
            const problems = Indentation.run(ast, config);
            console.log(problems);
            expect(problems.length).toEqual(0);
            expect(problems).toEqual([]);
        });
    });

    describe("invalid test data", () => {
        describe("without fix option", () => {
            const testData = getInvalidTestData(config).filter(
                (test) => test[4] !== true
            );

            it.each(testData)(
                "check indent: %s",
                (_, text, expectedProblems) => {
                    const ast = parser.parse(text);
                    const problems = Indentation.run(ast, config);

                    expect(problems.length).toEqual(expectedProblems.length);
                    expect(new Set(problems)).toEqual(
                        new Set(expectedProblems)
                    );
                }
            );

            describe("Failing", () => {
                const failingTestData = getInvalidTestData(config).filter(
                    (test) => test[4] === true
                );
                failingTestData.forEach((test) => {
                    it.failing(`check indent: ${test[0]}`, () => {
                        const ast = parser.parse(test[1]);
                        const problems = Indentation.run(ast, config);

                        expect(problems.length).toEqual(test[2].length);
                        expect(new Set(problems)).toEqual(new Set(test[2]));
                    });
                });
            });
        });

        // TODO: enable after fix option is implemented
        describe.skip("with fix option", () => {
            const configWithFix = {
                ...config,
                cliOptions: { fix: true },
            };
            const testData = getInvalidTestData(configWithFix).filter(
                (test) => test[4] !== true
            );

            it.each(testData)(
                "check fix data: %s",
                (_, text, expectedProblems) => {
                    const ast = parser.parse(text);

                    const problems = Indentation.run(ast, configWithFix);

                    expect(problems.length).toEqual(expectedProblems.length);
                    problems.forEach((problem, index) => {
                        expect(problem.applyFix).toBeInstanceOf(Function);
                        expect(problem.fixData).toMatchObject(
                            expectedProblems[index].fixData
                        );
                    });
                }
            );

            describe("Failing", () => {
                const failingTestData = getInvalidTestData(
                    configWithFix
                ).filter((test) => test[4] === true);
                failingTestData.forEach((test) => {
                    it.failing(`check indent: ${test[0]}`, () => {
                        const ast = parser.parse(test[1]);
                        const problems = Indentation.run(ast, config);

                        expect(problems.length).toEqual(test[2].length);
                        expect(new Set(problems)).toEqual(new Set(test[2]));
                    });
                });
            });
        });
    });

    // TODO: enable after fix option is implemented
    describe.skip("method: fixSingleLine", () => {
        const configWithFix = {
            ...config,
            cliOptions: { fix: true },
        };
        const testData = getTestDataWithFix(configWithFix);

        it.each(testData)(
            "apply fix: %s",
            (_, text, problem, expectedFixedText) => {
                const rule = new Indentation();
                const fixedText = rule.fixSingleLine(text, problem);

                expect(fixedText).toEqual(expectedFixedText);
            }
        );
    });

    // TODO: enable after fix option is implemented
    describe.skip("method: fixMultiLine", () => {
        const configWithFix = {
            ...config,
            cliOptions: { fix: true },
        };
        const testData = getTestDataWithFix(configWithFix, true);

        it.each(testData)(
            "apply fix: %s",
            (_, text, problem, expectedFixedText) => {
                const rule = new Indentation();
                const fixedText = rule.fixMultiLine(text, problem);

                expect(fixedText).toEqual(expectedFixedText);
            }
        );
    });
});
