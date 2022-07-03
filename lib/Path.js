const { extname } = require("path");
const fs = require("fs");
const glob = require("glob");
const log = require("./logging/logger");

module.exports = class Path {
    static get FEATURE_FILE_EXTENSION() {
        return ".feature";
    }

    static searchFiles(pattern, files = []) {
        glob.sync(pattern, { absolute: true, cwd: Path.cwd() }).map((match) => {
            if (Path.isDir(match)) {
                return Path.searchFiles(`${match}/*`, files);
            }
            if (extname(match) === Path.FEATURE_FILE_EXTENSION) {
                return files.push(match);
            }
        });
        return files;
    }

    static isFile(resourcePath) {
        try {
            return fs.statSync(resourcePath).isFile();
        } catch (err) {
            log.error(err.message);
        }
    }

    static isDir(resourcePath) {
        try {
            return fs.statSync(resourcePath).isDirectory();
        } catch (err) {
            log.error(err.message);
        }
    }

    static cwd() {
        return process.cwd();
    }
};
