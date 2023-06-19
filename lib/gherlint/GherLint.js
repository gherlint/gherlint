const fs = require("fs");
const glob = require("glob");
const { extname } = require("path");
const _ = require("lodash");

const { Linter } = require("../linter");
const { gherlintrc: defaultConfig } = require("../config");
const Path = require("../../utils/Path");

module.exports = class GherLint {
    #FEATURE_FILE_EXTENSION = ".feature";
    #problems = {};

    constructor(options) {
        this.linter = new Linter(defaultConfig, {
            fix: options.fix,
        });
        this.cliOpt = options;
    }

    lintFiles(paths) {
        this.getFeatureFiles(paths).forEach((file) => {
            const text = fs.readFileSync(file, "utf8");

            const lint = this.linter.lint(text);
            if (!_.isEmpty(lint.problems)) {
                this.storeProblems(file, lint);
            }

            if (this.cliOpt.fix && lint.text) {
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

    getFeatureFiles(paths) {
        const features = [];
        paths.forEach((path) => {
            features.push(...this.searchFeatureFiles(path));
        });

        return features;
    }

    searchFeatureFiles(pattern, files = []) {
        glob.sync(pattern, { absolute: true, cwd: Path.cwd() }).map((match) => {
            if (Path.isDir(match)) {
                return this.searchFeatureFiles(`${match}/*`, files);
            }
            if (extname(match) === this.#FEATURE_FILE_EXTENSION) {
                return files.push(match);
            }
        });
        return files;
    }
};
