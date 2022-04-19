const t = require("terminal-kit").terminal;

module.exports = {
    error: (message, payload, command) => {
        t.bgRed("[ERROR]").red(` ${message}\n`);
        if (payload) t.dim(`  ${payload}\n`);
        if (command) t.yellow(`\t${command}\n`);
        process.exit(1);
    },
    warn: (message, payload, command) => {
        t.bgYellow("[WARN]").yellow(` ${message}\n`);
        if (payload) t.dim(`  ${payload}\n`);
        if (command) t.yellow(`\t${command}\n`);
    },
    info: (message, payload, command) => {
        t.bgCyan("[INFO]").cyan(` ${message}\n`);
        if (payload) t.dim(`  ${payload}\n`);
        if (command) t.yellow(`\t${command}\n`);
    },
    success: (message, payload, command) => {
        t.bgGreen("[SUCCESS]").green(` ${message}\n`);
        if (payload) t.dim(`  ${payload}\n`);
        if (command) t.yellow(`\t${command}\n`);
    },
};
