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
        indentation: ["error", 2],
        no_repetitive_step_keyword: "error",
        require_step: "error",
        no_trailing_whitespace: "error",
        require_scenario: "error",
    },
};
