const fs = require("fs");
const log = require("../lib/logging/logger");

module.exports = class Path {
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
