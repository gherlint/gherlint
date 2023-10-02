const { Linter } = require("../../../lib/linter");
const { Rules } = require("../../../lib/rules");

const config = {
    rules: {
        indentation: "error",
        no_repetitive_step_keyword: "error",
    },
};

const mockProblem = [
    {
        ruleId: "indentation",
        type: "error",
        message: "Indentation error",
        location: {},
    },
];

describe("class: Linter", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    describe("method: lint", () => {
        describe("without fix option", () => {
            it("should return an empty array if no lint issues", () => {
                const spyRunRules = jest
                    .spyOn(Linter.prototype, "runRules")
                    .mockReturnValue([]);

                const linter = new Linter(config);
                const result = linter.lint("");

                expect(spyRunRules).toHaveBeenCalledTimes(1);
                expect(result.problems).toEqual([]);
                expect(result.elapsedTime).toBeGreaterThanOrEqual(0);
                expect(result).not.toHaveProperty("text");
            });
            it("should return problems", () => {
                const spyRunRules = jest
                    .spyOn(Linter.prototype, "runRules")
                    .mockReturnValue(mockProblem);

                const linter = new Linter(config);
                const result = linter.lint("");

                expect(spyRunRules).toHaveBeenCalledTimes(1);
                expect(result.problems).toEqual(mockProblem);
                expect(result.elapsedTime).toBeGreaterThanOrEqual(0);
            });
        });

        describe("with fix option", () => {
            const configWithFix = { ...config, fix: true };

            it("should return an empty array if no lint issues", () => {
                const spyRunRules = jest
                    .spyOn(Linter.prototype, "runRules")
                    .mockReturnValue([]);
                const spyFixLint = jest
                    .spyOn(Linter.prototype, "fixLint")
                    .mockReturnValue({
                        problems: [],
                        text: "",
                    });

                const linter = new Linter(configWithFix);
                const result = linter.lint("");

                expect(spyRunRules).toHaveBeenCalledTimes(1);
                expect(spyFixLint).toHaveBeenCalledTimes(1);
                expect(result.problems).toEqual([]);
                expect(result.elapsedTime).toBeGreaterThanOrEqual(0);
                expect(result).toHaveProperty("text");
            });
            it("should return problems", () => {
                const spyRunRules = jest
                    .spyOn(Linter.prototype, "runRules")
                    .mockReturnValue(mockProblem);
                const spyFixLint = jest
                    .spyOn(Linter.prototype, "fixLint")
                    .mockReturnValue({
                        problems: mockProblem,
                        text: "",
                    });

                const linter = new Linter(configWithFix);
                const result = linter.lint("");

                expect(spyRunRules).toHaveBeenCalledTimes(1);
                expect(spyFixLint).toHaveBeenCalledTimes(1);
                expect(result.problems).toEqual(mockProblem);
                expect(result.elapsedTime).toBeGreaterThanOrEqual(0);
                expect(result).toHaveProperty("text");
            });
        });

        describe("invalid gherkin file", () => {
            it("should return a problem", () => {
                const linter = new Linter(config);
                const result = linter.lint("Given a step");

                expect(result.problems).toEqual([
                    {
                        ruleId: "parse-error",
                        type: "error",
                        message: "Invalid Gherkin syntax",
                        location: { line: 1, column: 1 },
                    },
                ]);
            });
        });
    });

    describe("method: runRules", () => {
        it("should run all rules", () => {
            const spyGetRuleConfig = jest
                .spyOn(Linter.prototype, "getRuleConfig")
                .mockReturnValue({});

            const linter = new Linter(config);
            const problems = linter.runRules("");

            expect(spyGetRuleConfig).toHaveBeenCalledTimes(
                Object.keys(Rules).length
            );
            expect(problems).toEqual([]);
        });
    });

    describe("method: fixLint", () => {
        it("should return problems and text", () => {
            const text = " Feature: a feature";
            const problem = {
                ...mockProblem[0],
                applyFix: jest.fn(() => text.trim()),
            };
            const spyRunRules = jest
                .spyOn(Linter.prototype, "runRules")
                .mockReturnValue([]);
            const spyFixLint = jest.spyOn(Linter.prototype, "fixLint");
            const spyApplyFix = jest.spyOn(problem, "applyFix");

            const linter = new Linter(config);
            const result = linter.fixLint(text, [problem]);

            expect(spyApplyFix).toHaveBeenCalledWith(text, problem);
            expect(spyRunRules).toHaveBeenCalledWith(text.trim());
            expect(spyFixLint).toHaveBeenCalledTimes(2);
            expect(spyFixLint).toHaveBeenCalledWith(text.trim(), []);
            expect(result).toEqual({ problems: [], text: text.trim() });
        });
    });

    describe("method: getRuleConfig", () => {
        it("rule type as string", () => {
            const linter = new Linter(config);
            const result = linter.getRuleConfig("indentation");

            expect(result).toEqual({ type: "error", option: [] });
        });
        it("rule type as array", () => {
            const linter = new Linter({
                rules: {
                    indentation: ["error"],
                },
            });
            const result = linter.getRuleConfig("indentation");

            expect(result).toEqual({ type: "error", option: [] });
        });
        it("rule type with option", () => {
            const linter = new Linter({
                rules: {
                    indentation: ["error", 4],
                },
            });
            const result = linter.getRuleConfig("indentation");

            expect(result).toEqual({ type: "error", option: [4] });
        });
    });
});
