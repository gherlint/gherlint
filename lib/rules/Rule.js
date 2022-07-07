module.exports = class Rule {
    _ast = {};
    _config = {};
    _isFix = false;

    _problems = [];

    constructor(ast = {}, config = {}) {
        this._ast = ast;
        this._config = config;
        this._isFix = this._config.cliOption?.fix;
    }

    getProblems() {
        return this._problems;
    }

    static updateTextByLine(text, replaceBy, replaceTo, location) {
        // line and column numbers are 1 indexed
        const lineIndex = location.line - 1;
        const columnIndex = location.column - 1;

        const lines = text.split("\n");
        const problemLine = lines[lineIndex];
        let updatedLine =
            problemLine.slice(0, columnIndex) +
            replaceBy +
            problemLine.slice(columnIndex + replaceTo.length);

        lines[lineIndex] = updatedLine;

        return lines.join("\n");
    }
};
