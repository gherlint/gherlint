#!/usr/bin/env node

// main function
(async function main() {
    process.exitCode = await require("../lib/cli").execute(process.argv);
})().catch((err) => {
    process.exitCode = 2;
    console.error(err);
});
