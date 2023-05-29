const fs = require("fs");
const path = require("path");

const { Linter } = require("../linter");
const { gherlintrc: defaultConfig } = require("../config");
const { isDir } = require("../../utils/Path");

module.exports = class GherLint {
    static {
        GherLint.linter = new Linter(defaultConfig);
        GherLint.problems = {};
    }

    static async lintFiles(paths) {
        GherLint.resolvePaths(paths).forEach((file) => {
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
        const realPath = path.resolve(process.cwd(), file);
        if (isDir(realPath)) {
            throw new Error(
                "Please, provide a single feature file or a glob pattern. We don't support directories yet."
            );
        }
        return realPath;
    }

    static resolvePaths(paths) {
        return paths.map((file) => GherLint.resolvePath(file));
    }

    static readConfigFile() {}
};
