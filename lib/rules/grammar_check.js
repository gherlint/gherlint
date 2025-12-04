const Rule = require("./Rule");
const {isEmpty: _isEmpty} = require("lodash");
// const harper = import("harper.js");

module.exports = class GrammarCheck extends Rule {
    static meta = {
        ruleId: "grammar_check",
        message: "Grammar check failed",
        type: "warn", // (warn | error | off)
        hasFix: false, // (true | false) - if the rule has a fixer or not
    };

    constructor(ast, config) {
        super(ast, config);
    }

    static async run(ast, config) {
        return await new GrammarCheck(ast, config).execute();
    }

    async execute() {
        const harper = await import("harper.js");

        if (_isEmpty(this._ast?.feature)) {
            return [];
        }
        // We cannot use `WorkerLinter` on Node.js since it relies on web-specific APIs.
        // This constructs the linter to consume American English.
        const linter = new harper.LocalLinter({
            binary: harper.binary,
            dialect: harper.Dialect.American,
        });

        const lints = await linter.lint(this._ast.feature.name);

        console.log("Here are the results of linting the above text:");

        for (const lint of lints) {
            console.log(' - ', lint.span().start, ':', lint.span().end, lint.message());

            if (lint.suggestion_count() !== 0) {
                console.log('Suggestions:');

                for (const sug of lint.suggestions()) {
                    console.log(
                        '\t - ',
                        sug.kind() === 1 ? 'Remove' : 'Replace with',
                        sug.get_replacement_text(),
                    );
                }
            }
        }


        return [];
    }
};
