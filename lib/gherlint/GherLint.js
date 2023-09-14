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

            const lint = this.#linter.lint(text);
            if (!_.isEmpty(lint.problems)) {
                this.storeProblems(file, lint);
            }

            if (this.#configObj.configuration.fix && lint.text) {
                this.updateFile(file, lint.text);
            }
        });
        return this.getProblems();
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
