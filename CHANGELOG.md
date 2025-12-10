# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   New lint rule:
    - `then_should_have_should` - checks that every Then step contains a 'should' (https://github.com/gherlint/gherlint/pull/145)
-   Use [harper](https://github.com/Automattic/harper/) to check the grammar of the feature files

### Changed

### Fixed

## [1.1.0] - 2024-06-11

### Added

-   New option for `newline_before_scenario` rule to allow counting tags and comments as a new line (https://github.com/gherlint/gherlint/pull/114)
    ```js
    newline_before_scenario: ["error", 2, true];
    ```
-   New lint rule:
    -   `no_but_in_given_when` - checks that But is not used in Given or When steps (https://github.com/gherlint/gherlint/pull/111)
        ```js
        no_but_in_given_when: ["warn"];
        ```

### Changed

-   Allow more than one nonconsecutive But in Then section of a Scenario (https://github.com/gherlint/gherlint/pull/115)

### Fixed

-   Fix whitespaces reported in DocStrings (https://github.com/gherlint/gherlint/pull/116)

## [1.0.0] - 2024-05-13

### Added

-   New cli option: `-c, --config` - provide config file using gherlint command (https://github.com/gherlint/gherlint/pull/101)
-   New lint rule:
    -   `require_scenario` - enforces that a feature file has at least one scenario (https://github.com/gherlint/gherlint/pull/87)
    -   `no_trailing_whitespace` - checks trailing whitespaces (https://github.com/gherlint/gherlint/pull/86)
    -   `require_step` - ensures that a Background or a Scenario has at least one step (https://github.com/gherlint/gherlint/pull/88)
    -   `no_repetitive_step_keyword` - checks repetitive use of step keywords (https://github.com/gherlint/gherlint/pull/52)
    -   `indentation` - checks indentation of gherkin files
    -   `no_then_as_first_step` - checks that Then is not a first step in a Scenario or Scenario Outline (https://github.com/gherlint/gherlint/pull/89)
    -   `only_given_step_in_background` - ensures that a Background has only a Given step (https://github.com/gherlint/gherlint/pull/92)
    -   `newline_before_scenario` - checks for a new line before scenario (https://github.com/gherlint/gherlint/pull/94)
    -   `lowercase_title` - ensures that a Feature, Rule, Background, Scenario and Scenario Outline has a lowercase title (https://github.com/gherlint/gherlint/pull/99)
-   Show elapsed times for linting and command execution (https://github.com/gherlint/gherlint/pull/82)
-   Successful linting now shows a success message (https://github.com/gherlint/gherlint/pull/81)
-   Report invalid gherkin file as lint error (https://github.com/gherlint/gherlint/pull/63)
-   gherlint command now supports `--fix` option to fix lint errors (https://github.com/gherlint/gherlint/pull/31)
-   gherlint cli command (https://github.com/gherlint/gherlint/pull/101)

### Fixed

-   Incorrect doc string formatting (https://github.com/gherlint/gherlint/pull/79)
-   Fix command freezes for long time (https://github.com/gherlint/gherlint/pull/78)
-   Installation on node version higher than 12 gives warning (https://github.com/gherlint/gherlint/pull/72)
-   Rules that has `off` type also get reported (https://github.com/gherlint/gherlint/pull/96)
-   NaN when indentation value is not provided (https://github.com/gherlint/gherlint/pull/98)
-   `.gherlintrc.js` doesn't work from subfolder (https://github.com/gherlint/gherlint/pull/106)
