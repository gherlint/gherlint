#!/usr/bin/env node

// init global configs
require("../global/init");

// main function
(async function main() {
    const { Cli } = require("../lib/cli");
    const exitCode = await Cli.execute(process.argv);
    process.exit(exitCode);
})().catch((err) => {
    console.error(err);
    process.exit(2);
});
