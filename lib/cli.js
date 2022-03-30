const fs = require("fs");
const path = require("path");

const CLIOptions = require("./cliOptions");
const Parser = require("./parser/index");

module.exports = {
    async execute(args) {
        const options = CLIOptions.parse(args.slice(2));
        // TODO: determine project root dir
        // const content = fs.readFileSync(args[2], { encoding: "utf-8" });
        const ast = await new Parser().parse(args[2]);
        // console.log("here...");
        console.log(ast.feature.children);
    },
};
