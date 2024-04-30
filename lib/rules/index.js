module.exports = {
    Rule: require("./Rule"),
    ruleOptions: require("./_ruleOptions"),
    Rules: {
        indentation: require("./indentation"),
        no_repetitive_step_keyword: require("./no_repetitive_step_keyword"),
        require_step: require("./require_step"),
        no_trailing_whitespace: require("./no_trailing_whitespace"),
        require_scenario: require("./require_scenario"),
        no_then_as_first_step: require("./no_then_as_first_step"),
    },
};
