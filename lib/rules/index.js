module.exports = {
    Rule: require("./Rule"),
    ruleOptions: require("./_ruleOptions"),
    Rules: {
        indentation: require("./indentation"),
        no_repetitive_step_keyword: require("./no_repetitive_step_keyword"),
        require_step: require("./require_step"),
    },
};
