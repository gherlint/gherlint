const fs = require("fs");
const path = require("path");

const { Linter } = require("../linter");
const { gherlintrc: defaultConfig } = require("../config");

module.exports = class GherLint {
    static {
        GherLint.linter = new Linter(defaultConfig);
        GherLint.problems = {};
    }

    static async lintFiles(files) {
        GherLint.resolvePaths(files).forEach((file) => {
            const text = fs.readFileSync(file, "utf8");

            const problems = GherLint.linter.lint(text);

            GherLint.storeProblems(file, problems);
        });

        return GherLint.problems;
    }

    static storeProblems(path, problems) {
        GherLint.problems[path] = problems;
    }

    static resolvePath(file) {
        return path.resolve(process.cwd(), file);
    }

    static resolvePaths(files) {
        return files.map((file) => GherLint.resolvePath(file));
    }

    static readConfigFile() {}
};
