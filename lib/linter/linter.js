const Parser = require("../parser");
const Rules = require("../rules");

module.exports = class Linter {
    constructor() {
        //
    }

    async lintFiles(files) {
        for (const file of files) {
            const ast = await Parser.parse(file);

            // Run rules
            Object.keys(Rules).forEach((rule) => {
                Rules[rule].run(ast);
            });
        }
    }

    async lintText(text) {}
};
