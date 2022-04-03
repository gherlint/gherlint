const indentation = Object.freeze({
    Feature: 0,
    Rule: 1,
    Background: 2,
    Scenario: 2,
    "Scenario Outline": 2,
    Given: 3,
    When: 3,
    Then: 3,
    But: 3,
    And: 3,
    Examples: 3,
    DocString: 4,
    DataTable: 4,
    ExampleTable: 4,
});

module.exports = function (keyword, config = {}, hasRule = false) {
    // TODO: parse from config
    const tabSize = config.tabSize || 4;
    let expectedIndent = indentation[keyword] * tabSize;

    if (!hasRule) {
        expectedIndent -= indentation["Rule"] * tabSize;
    }

    if (expectedIndent <= 0) return 0;

    return expectedIndent;
};
