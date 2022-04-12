const { keys, isEmpty } = require("lodash");
const t = require("terminal-kit").terminal;

module.exports = class LintLogger {
    static log(messages) {
        let errCount = 0;
        let warnCount = 0;

        if (isEmpty(messages)) {
            return 0;
        }

        // start with new line
        t("\n");

        keys(messages).forEach((file) => {
            t.underline(`${file}\n`);
            messages[file].forEach(({ ruleId, type, location, message }) => {
                if (type === "error") errCount++;
                if (type === "warn") warnCount++;

                LintLogger.buildLintMessage(ruleId, type, location, message);
            });
        });

        // summary line
        const pCount = errCount + warnCount;
        let problems = "problem";
        let errors = "error";
        let warns = "warning";
        if (pCount > 1) problems += "s";
        if (errCount > 1) errors += "s";
        if (warnCount > 1) warns += "s";

        t("\n")
            .bgRed("ERROR")
            .white(` ${pCount} ${problems} (`)
            .red(`${errCount} ${errors}, `)
            .yellow(`${warnCount} ${warns}`)
            .white(")\n");

        return 1;
    }

    static buildLintMessage(ruleId, type, location, message) {
        t("  ");
        if (type === "error") t.red(type);
        else if (type === "warn") t.yellow(type);
        t("  ")
            .dim(`${location.line}:${location.column}  `)
            .white(`${message}  `)
            .dim(`${ruleId}\n`);
    }
};
