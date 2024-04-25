const Rule = require("./Rule");

module.exports = class NoTrailingWhitespace extends Rule {
    static meta = {
        ruleId: "no_trailing_whitespace",
        message: "No trailing whitespaces",
        type: "error", // (warn | error | off)
        hasFix: true, // (true | false) - if the rule has a fixer or not
    };

    // Rule entry point
    static run(ast, config) {
        if (!ast?.text) return [];

        const problems = [];
        let lineIndex = 0;
        for (const line of ast.text.split("\n")) {
            lineIndex++;
            const match = line.match(/\s+$/);
            if (match !== null) {
                const location = { line: lineIndex, column: match.index + 1 };
                problems.push({
                    ...NoTrailingWhitespace.meta,
                    type: config.type,
                    location,
                    applyFix: NoTrailingWhitespace.fixTrailingWhitespace,
                });
            }
        }
        return problems;
    }

    static fixTrailingWhitespace(text, problem) {
        const lines = text.split("\n");
        const {
            location: { line },
        } = problem;

        const lineText = lines[line - 1];
        lines[line - 1] = lineText.trimEnd();

        return lines.join("\n");
    }
};
