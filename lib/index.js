module.exports = {
    ...require("./cli"),
    ...require("./gherlint"),
    ...require("./config"),
    ...require("./linter"),
    ...require("./logging"),
    ...require("./rules"),
};