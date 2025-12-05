const Rule = require("./Rule");
const {isEmpty: _isEmpty, trimStart} = require("lodash");
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
        const lintOptions = {language: "plaintext"};
        let harperLints = await linter.lint(this._ast.feature.name, lintOptions);

        for (const line of this._ast.feature.description.split("\n")) {
            harperLints = [...harperLints, ...await linter.lint(trimStart(line), lintOptions)];
        }

        for (const lint of harperLints) {
            // console.log(this._ast);
            let message = lint.message();
            if (lint.suggestion_count() !== 0) {
                message += " Suggestions: ";
                let currentSuggestionCount = 1;
                for (const sug of lint.suggestions()) {
                    message +=
                        "\t - " +
                        sug.kind() === 1 ? "Remove" : "Replace with" + " '" +
                        sug.get_replacement_text() + "'";
                    if (lint.suggestion_count() > currentSuggestionCount) {
                        message += " OR ";
                    }
                    currentSuggestionCount++;
                }
            }
            this.storeLintProblem({
                ...GrammarCheck.meta,
                type: this._config.type,
                message: message,
                location: {line: this._ast.feature.location.line, column: lint.span().start},
            });

            // console.log(' - ', lint.span().start, ':', lint.span().end, lint.message());
            //
            // if (lint.suggestion_count() !== 0) {
            //     console.log('Suggestions:');
            //
            //     for (const sug of lint.suggestions()) {
            //         console.log(
            //             '\t - ',
            //             sug.kind() === 1 ? 'Remove' : 'Replace with',
            //             sug.get_replacement_text(),
            //         );
            //     }
            // }
        }

        return this.getProblems();

    }
};
