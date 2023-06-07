const fs = require("fs");
const glob = require("glob");
const { extname } = require("path");

const { Linter } = require("../linter");
const { gherlintrc: defaultConfig } = require("../config");
const Path = require("../../utils/Path");

module.exports = class GherLint {
    static {
        GherLint.linter = new Linter(defaultConfig);
        GherLint.problems = {};
        GherLint.FEATURE_FILE_EXTENSION = ".feature";
    }

    static async lintFiles(paths) {
        GherLint.getFeatureFiles(paths).forEach((file) => {
            const text = fs.readFileSync(file, "utf8");

            const problems = GherLint.linter.lint(text);

            GherLint.storeProblems(file, problems);
        });

        return GherLint.problems;
    }

    static storeProblems(path, problems) {
        GherLint.problems[path] = problems;
    }

    static getFeatureFiles(paths) {
        const features = [];
        paths.forEach((path) => {
            features.push(...GherLint.searchFeatureFiles(path));
        });

        return features;
    }

    static searchFeatureFiles(pattern, files = []) {
        glob.sync(pattern, { absolute: true, cwd: Path.cwd() }).map((match) => {
            if (Path.isDir(match)) {
                return GherLint.searchFeatureFiles(`${match}/*`, files);
            }
            if (extname(match) === GherLint.FEATURE_FILE_EXTENSION) {
                return files.push(match);
            }
        });
        return files;
    }
};
