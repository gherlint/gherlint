module.exports = {
    /**
     * path to feature files
     * files, dir or blob
     */
    files: [],
    /**
     * TODO: implement ignorepattern
     * list of ignore patterns: files, dirs or glob
     */
    ignorePatterns: [],
    /**
     * Linting rules
     *
     * labels:
     * - error
     * - warn
     * - off
     */
    rules: {
        indentation: "error",
        no_repetitive_step_keyword: "error",
        require_step: "error",
        no_trailing_whitespace: "error",
        require_scenario: "error",
        no_then_as_first_step: "warn",
        only_given_step_in_background: "warn",
        newline_before_scenario: "off",
        lowercase_title: "off",
        no_but_in_given_when: "warn",
        require_when_and_then_step: "warn",
        grammar_check: "warn",
        then_should_have_should: "error",
        words_to_avoid: "error",
    },
};
