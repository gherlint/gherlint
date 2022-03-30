#!/usr/bin/env node

// main function
(function main() {
    process.exitCode = require("../lib/cli").execute(process.argv);
})();
