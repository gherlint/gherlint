const {
    getValidTestData,
    getInvalidTestData,
    getTestDataWithFix,
} = require("../../__fixtures__/Rules/indentation/testdata");
const Indentation = require("../../../lib/rules/indentation");
const parser = require("../helpers/parser");

const config = {
    rules: {
        indentation: ["warn", 2],
    },
    cliOptions: {},
};

describe("Indentation rule", () => {
    describe("empty ast", () => {
        it("empty args: should return undefined", () => {
            const rule = Indentation.run();
            expect(rule.getProblems()).toEqual([]);
        });
        it("empty ast object: should return undefined", () => {
            const rule = Indentation.run({});
            expect(rule.getProblems()).toEqual([]);
        });
    });

    describe("valid test data", () => {
        const testData = getValidTestData();

        it.each(testData)("check indent: %s", (_, text) => {
            const ast = parser.parse(text);
            const rule = Indentation.run(ast, config);
            const problems = rule.getProblems();

            expect(problems.length).toEqual(0);
            expect(problems).toEqual([]);
        });
    });

    describe("invalid test data", () => {
        describe("without fix option", () => {
            const testData = getInvalidTestData(config);

            it.each(testData)(
                "check indent: %s",
                (_, text, expectedProblems) => {
                    const ast = parser.parse(text);
                    const rule = Indentation.run(ast, config);
                    const problems = rule.getProblems();

                    expect(problems.length).toEqual(expectedProblems.length);
                    expect(new Set(problems)).toEqual(
                        new Set(expectedProblems)
                    );
                }
            );
        });

        describe("with fix option", () => {
            const configWithFix = {
                ...config,
                cliOptions: { fix: true },
            };
            const testData = getInvalidTestData(configWithFix);

            it.each(testData)(
                "check fix data: %s",
                (_, text, expectedProblems) => {
                    const ast = parser.parse(text);

                    const rule = Indentation.run(ast, configWithFix);
                    const problems = rule.getProblems();

                    expect(problems.length).toEqual(expectedProblems.length);
                    problems.forEach((problem, index) => {
                        expect(problem.applyFix).toBeInstanceOf(Function);
                        expect(problem.fixData).toMatchObject(
                            expectedProblems[index].fixData
                        );
                    });
                }
            );
        });
    });

    describe("method: fixSingleLine", () => {
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

    describe("method: fixMultiLine", () => {
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
