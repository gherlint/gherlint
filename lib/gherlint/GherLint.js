const fs = require("fs");
const _ = require("lodash");

const { Linter } = require("../linter");
const Fs = require("../../utils/Fs");

module.exports = class GherLint {
    #problems = {};
    #configObj = null;
    #linter = null;

    constructor(configObj) {
        this.#configObj = configObj;
        this.#linter = new Linter(configObj.configuration);
    }

    lintFiles() {
        this.#configObj.featureFiles.forEach((file) => {
            const text = Fs.readFile(file);

            const result = this.runLinter(file, text);

            if (this.#configObj.configuration.fix && result.text) {
                this.updateFile(file, result.text);
                // re-lint after a fix has been applied
                this.runLinter(file, result.text, true);
            }
        });
        return this.getProblems();
    }

    runLinter(file, text, isReLint = false) {
        const result = this.#linter.lint(text, isReLint);

        if (!_.isEmpty(result.problems)) {
            this.storeProblems(file, result);
        }

        return result;
    }

    storeProblems(path, problems) {
        this.#problems[path] = problems;
    }

    getProblems() {
        return this.#problems;
    }

    updateFile(file, text) {
        fs.writeFileSync(file, text, "utf8");
    }
};
