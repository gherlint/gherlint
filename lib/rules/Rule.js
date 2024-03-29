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

    storeLintProblem(problem) {
        this._problems.push(problem);
    }
};
