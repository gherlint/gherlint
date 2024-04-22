# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   New lint rule `no_trailing_whitespace` - checks trailing whitespaces (https://github.com/gherlint/gherlint/pull/86)
-   New lint rule `require_step` - ensures that a Background or a Scenario has at least one step (https://github.com/gherlint/gherlint/pull/88)
-   Show elapsed times for linting and command execution (https://github.com/gherlint/gherlint/pull/82)
-   Successful linting now shows a success message (https://github.com/gherlint/gherlint/pull/81)
-   Report invalid gherkin file as lint error (https://github.com/gherlint/gherlint/pull/63)
-   New lint rule `no_repetitive_step_keyword` - checks repetitive use of step keywords (https://github.com/gherlint/gherlint/pull/52)
-   gherlint command now supports `--fix` option to fix lint errors (https://github.com/gherlint/gherlint/pull/31)
-   New lint rule `indentation` - checks indentation of gherkin files
-   gherlint cli command

### Fixed

-   Incorrect doc string formatting (https://github.com/gherlint/gherlint/pull/79)
-   Fix command freezes for long time (https://github.com/gherlint/gherlint/pull/78)
-   Installation on node version higher than 12 gives warning (https://github.com/gherlint/gherlint/pull/72)
