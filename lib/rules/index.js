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
        only_given_step_in_background: require("./only_given_step_in_background"),
        newline_before_scenario: require("./newline_before_scenario"),
        lowercase_title: require("./lowercase_title"),
        no_but_in_given_when: require("./no_but_in_given_when"),
        require_when_step: require("./require_when_step"),
    },
};
