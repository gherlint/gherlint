const fs = require("fs");
const log = require("../lib/logging/logger");

module.exports = class Path {
    static readFile(file) {
        try {
            return fs.readFileSync(file, { encoding: "utf-8" });
        } catch (err) {
            log.error(err.message);
        }
    }

    static writeFile(filePath, content) {
        try {
            return fs.writeFileSync(filePath, content, { encoding: "utf-8" });
        } catch (err) {
            log.error(err.message);
        }
    }
};
