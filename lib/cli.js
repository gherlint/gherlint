const CLIOptions = require("./cliOptions");

module.exports = {
    execute(args) {
        const options = CLIOptions.parse(args.slice(2));
    },
};
