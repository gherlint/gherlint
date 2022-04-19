const { fromPaths } = require("gherkin").default;
const fs = require("fs");

const FeatureDocument = require("./FeatureDocument");

module.exports = class Parser {
    static parse(file) {
        const data = Parser.readFile(file);

        // AST
        const ast = new FeatureDocument();
        ast.start = Parser.#getStartIndex(data);
        ast.end = Parser.#getEndIndex(data);

        return new Promise((resolve, reject) => {
            const stream = fromPaths([file], {
                includePickles: false,
                includeSource: false,
            });

            stream.on("error", (err) => reject(err));

            stream.on("data", (chunk) => {
                // parsing error
                if (chunk.attachment) {
                    ast.error = chunk.attachment.source;
                    resolve(ast);
                } else {
                    const { comments, uri } = chunk.gherkinDocument;
                    ast.comments = comments;
                    ast.feature = chunk.gherkinDocument.feature || {};
                    ast.path = uri;
                }
            });

            stream.on("end", () => resolve(ast));
        });
    }

    static readFile(filePath) {
        return fs.readFileSync(filePath, { encoding: "utf-8" });
    }

    static #getStartIndex(data) {
        return data.search(/(?<=[\s]*)\S/);
    }

    static #getEndIndex(data) {
        return data.trimEnd().length;
    }
};
