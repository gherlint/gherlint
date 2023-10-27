const { Logger } = require("../../../lib/logging");
const { cloneDeep } = require("lodash");

const terminal = function () {};
terminal.cyan = () => terminal;
terminal.bgGreen = () => terminal;
terminal.bgRed = () => terminal;
terminal.white = () => terminal;
terminal.red = () => terminal;
terminal.yellow = () => terminal;
terminal.underline = () => terminal;
terminal.dim = () => terminal;

jest.mock("terminal-kit", () => ({
    terminal,
}));

describe("class: LintLogger", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const warnProblems = {
        file1: {
            elapsedTime: 0,
            problems: [
                {
                    ruleId: "rule1",
                    type: "warn",
                    location: {},
                    message: "message1",
                },
            ],
        },
    };
    const errorProblems = { file2: cloneDeep(warnProblems.file1) };
    errorProblems.file2.problems[0].type = "error";

    it("should return exitcode 0 if there is no error", () => {
        const sypLogProblem = jest
            .spyOn(Logger, "logProblem")
            .mockReturnValue();
        const exitCode = Logger.log([]);

        expect(sypLogProblem).toHaveBeenCalledTimes(0);
        expect(exitCode).toBe(0);
    });
    it("should return exitcode 0 if there are only warning", () => {
        const sypLogProblem = jest
            .spyOn(Logger, "logProblem")
            .mockReturnValue();

        const exitCode = Logger.log(warnProblems);

        expect(sypLogProblem).toHaveBeenCalledTimes(1);
        expect(exitCode).toBe(0);
    });
    it("should return exitcode 1 if there are errors", () => {
        const sypLogProblem = jest
            .spyOn(Logger, "logProblem")
            .mockReturnValue();

        const exitCode = Logger.log(errorProblems);

        expect(sypLogProblem).toHaveBeenCalledTimes(1);
        expect(exitCode).toBe(1);
    });
    it("should return exitcode 1 if there are errors and warnings", () => {
        const sypLogProblem = jest
            .spyOn(Logger, "logProblem")
            .mockReturnValue();
        const problems = {
            ...warnProblems,
            ...errorProblems,
        };

        const exitCode = Logger.log(problems);

        expect(sypLogProblem).toHaveBeenCalledTimes(2);
        expect(exitCode).toBe(1);
    });
});
