const stream = require("stream");
const fs = require("fs");
const makeGherkinOptions = require("../../node_modules/gherkin/dist/src/makeGherkinOptions.js");
const ParserMessageStream = require("../../node_modules/gherkin/dist/src/stream/ParserMessageStream.js");
const SourceMessageStream = require("../../node_modules/gherkin/dist/src/stream/SourceMessageStream.js");

module.exports = function (paths, options) {
    if (options === void 0) {
        options = {};
    }
    options = makeGherkinOptions(options);
    // if (process.env.GHERKIN_EXECUTABLE) {
    //     return new GherkinExe_1.default(
    //         process.env.GHERKIN_EXECUTABLE,
    //         paths,
    //         [],
    //         options
    //     ).messageStream();
    // }
    var combinedMessageStream = new stream.PassThrough({
        writableObjectMode: true,
        readableObjectMode: true,
    });
    function pipeSequentially() {
        var path = paths.shift();
        if (path !== undefined) {
            var parserMessageStream = new ParserMessageStream.default(options);
            parserMessageStream.on("end", function () {
                pipeSequentially();
            });
            var end = paths.length === 0;
            fs.createReadStream(path, { encoding: "utf-8" })
                .pipe(new SourceMessageStream.default(path))
                .pipe(parserMessageStream)
                .pipe(combinedMessageStream, { end: end });
        }
    }
    pipeSequentially();
    return combinedMessageStream;
};
