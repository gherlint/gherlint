const {
    Parser,
    AstBuilder,
    GherkinClassicTokenMatcher,
} = require("@cucumber/gherkin");
const { IdGenerator } = require("@cucumber/messages");

const parser = new Parser(
    new AstBuilder(IdGenerator.incrementing()),
    new GherkinClassicTokenMatcher()
);

module.exports.parse = function (text) {
    return parser.parse(text);
};
