module.exports = class LintLogger {
    static log(messages) {
        let errCount = 0;
        let warnCount = 0;

        Object.keys(messages).forEach((file) => {
            let log = [file];
            messages[file].forEach(({ ruleId, type, location, message }) => {
                if (type === "error") errCount++;
                if (type === "warn") warnCount++;
                log.push(
                    LintLogger.buildMessage(ruleId, type, location, message)
                );
            });
            log.push("\r");
            console.error(log.join("\n"));
        });

        console.info(
            `:x: ${
                errCount + warnCount
            } problems (${errCount} errors, ${warnCount} warnings)`
        );

        return 1;
    }

    static buildMessage(ruleId, type, location, message) {
        return `:${type}:  ${location.line}:${location.column}  ${message}  ${ruleId}`;
    }
};
