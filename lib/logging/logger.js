const t = require("terminal-kit").terminal;

module.exports = {
    error: (...args) => {
        module.exports.log(args, "error");
        process.exit(1);
    },
    warn: (...args) => {
        module.exports.log(args, "warn");
    },
    info: (...args) => {
        module.exports.log(args, "info");
    },
    success: (...args) => {
        module.exports.log(args, "success");
    },
    log: (message, type) => {
        const msg = message[0] || "";
        switch (type) {
            case "error":
                t.bgRed("[ERROR]").red(` ${msg}`);
                break;
            case "warn":
                t.bgYellow("[WARN]").yellow(` ${msg}`);
                break;
            case "info":
                t.bgYellow("[INFO]").yellow(` ${msg}`);
                break;
            case "success":
                t.bgGreen("[SUCCESS]").green(` ${msg}`);
                break;
            default:
                t.white(msg);
                break;
        }

        t("\n");

        ![null, undefined].includes(message[1]) && t.dim(`  ${message[1]}\n`);
        ![null, undefined].includes(message[2]) &&
            t.yellow(`\t${message[2]}\n`);

        if (message.length > 3) {
            t.white(`${message.slice(3).join("\n")}\n`);
        }
    },
};
