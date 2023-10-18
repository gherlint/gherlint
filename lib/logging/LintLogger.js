const { keys, isEmpty } = require("lodash");
const t = require("terminal-kit").terminal;

module.exports = class LintLogger {
    static log(messages) {
        let errCount = 0;
        let warnCount = 0;

        if (isEmpty(messages)) {
            t.cyan("[INFO] Linting complete.\n");
        }

        // start with new line
        t("\n");

        keys(messages).forEach((file) => {
            t.underline(file);
            t.dim(` (${messages[file].elapsedTime})`);
            t("\n");

            messages[file].problems.forEach(
                ({ ruleId, type, location, message }) => {
                    if (type === "error") errCount++;
                    if (type === "warn") warnCount++;

                    LintLogger.logProblem(ruleId, type, location, message);
                }
            );

            // seperate each file by new line
            t("\n");
        });

        t("\n");

        // summary line
        const pCount = errCount + warnCount;
        let problems = "problem";
        let errors = "error";
        let warns = "warning";
        if (pCount > 1) problems += "s";
        if (errCount > 1) errors += "s";
        if (warnCount > 1) warns += "s";

        let exitCode = 0;

        if (isEmpty(messages) || errCount === 0) {
            t.bgGreen("PASS");
        } else {
            exitCode = 1;
            t.bgRed("ERROR");
        }

        t.white(` ${pCount} ${problems} (`)
            .red(`${errCount} ${errors}, `)
            .yellow(`${warnCount} ${warns}`)
            .white(")\n");

        return exitCode;
    }

    static logProblem(ruleId, type, location, message) {
        t("  ");
        if (type === "error") t.red(type);
        else if (type === "warn") t.yellow(type);
        t("  ")
            .dim(`${location.line}:${location.column}  `)
            .white(`${message}  `)
            .dim(`${ruleId}\n`);
    }
};
