const fs = require("fs");

module.exports = class Path {
    static readFile(file) {
        return fs.readFileSync(file, { encoding: "utf-8" });
    }
};
