#!/usr/bin/env node

// main function
(function main() {
    return require("../lib/cli").execute(process.argv);
})().catch((err) => console.error(err));
