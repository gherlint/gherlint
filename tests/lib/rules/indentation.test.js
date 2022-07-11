const {
    getTestData,
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
    describe("without fix option", () => {
        const testData = getTestData(config);

        it.each(testData)("check indent: %s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);
            const rule = Indentation.run(ast, config);
            const problems = rule.getProblems();

            expect(problems.length).toEqual(expectedProblems.length);
            expect(new Set(problems)).toEqual(new Set(expectedProblems));
        });
    });

    describe("with fix option", () => {
        const configWithFix = {
            ...config,
            cliOptions: { fix: true },
        };
        const testData = getTestData(configWithFix);

        it.each(testData)("check fix: %s", (_, text, expectedProblems) => {
            const ast = parser.parse(text);

            const rule = Indentation.run(ast, configWithFix);
            const problems = rule.getProblems();

            problems.forEach((problem, index) => {
                expect(problem.fixData).toMatchObject(
                    expectedProblems[index].fixData
                );
            });
        });
    });
});
