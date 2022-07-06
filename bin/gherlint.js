#!/usr/bin/env node

// main function
(async function main() {
    const exitCode = await require("../lib/Cli").execute(process.argv);
    process.exit(exitCode);
})().catch((err) => {
    console.error(err);
    process.exit(2);
});
