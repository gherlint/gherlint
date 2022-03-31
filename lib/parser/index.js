const { fromPaths } = require("gherkin").default;
const fs = require("fs");

const FeatureDocument = require("./FeatureDocument");

module.exports = class Parser {
    #document = null;

    parse(file) {
        this.#readFile(file);

        const ast = new FeatureDocument();
        ast.start = this.#getStartIndex();
        ast.end = this.#getEndIndex();

        return new Promise((resolve, reject) => {
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
                    const { comments, feature, uri } = chunk.gherkinDocument;
                    ast.comments = comments;
                    ast.feature = feature;
                    ast.path = uri;
                }
            });

            stream.on("end", () => resolve(ast));
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
