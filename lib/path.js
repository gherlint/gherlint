const path = require("path");
const glob = require("glob");
const { getCwd } = require("./environment");

const EXT_NAME = ".feature";

module.exports = {
    resolveFeatureFiles: function resolvePath(pattern) {
        const files = [];
        glob.sync(pattern, { absolute: true, cwd: getCwd() }).map((match) => {
            if (path.extname(match) === "") {
                return files.push(...resolvePath(`${match}/**/*${EXT_NAME}`));
            }
            if (path.extname(match) === EXT_NAME) return files.push(match);

            return;
        });
        return files;
    },
};
