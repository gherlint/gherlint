const { fromPaths } = require("gherkin").default;
const fs = require("fs");

const FeatureDocument = require("./FeatureDocument");

module.exports = class Parser {
    #document = null;

    parse(file) {
        this.#readFile(file);

        const ast = new FeatureDocument({
            type: "FeatureDocument",
            start: this.#getStartIndex(),
            end: this.#getEndIndex(),
        });

        return new Promise((resolve, reject) => {
            let document = {};

            const stream = fromPaths([file], {
                includePickles: false,
                includeSource: false,
            });

            stream.on("error", (res) => reject("Error"));
            stream.on("data", (chunk) => {
                // parsing error
                if (chunk.attachment) {
                    console.error(chunk.attachment);
                } else {
                    const { comments, feature } = chunk.gherkinDocument;
                    ast.comments = comments;
                    ast.feature = feature;
                }
            });
            stream.on("end", () => {
                resolve(ast);
            });
        });
    }

    #readFile(filePath) {
        this.#document = fs.readFileSync(filePath, { encoding: "utf-8" });
    }

    #getStartIndex() {
        return this.#document.search(/(?<=[\s]*)\S/);
    }

    #getEndIndex() {
        return this.#document.trimEnd().length;
    }
};
