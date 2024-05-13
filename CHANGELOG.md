# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-rc.1] - 2024-05-09

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
