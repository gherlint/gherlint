# Contribution Guide

We thank you for taking the time to contribute to our project. Using this guide, you will get an overview of the contribution workflow, such as opening an issue and creating a PR.

But first, read our [CODE OF CONDUCT](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## Table of Contents

-   [Bug Report](#bug-report)
-   [Feature Request](#feature-request)
-   [Pull Request](#pull-request)
-   [Git Commit Message](#git-commit-message)

### Bug Report

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and come up with viable fixes.

If you find a bug, before creating a new issue, check the following guidelines:

1. Search in the existing [issues](https://github.com/gherlint/gherlint/issues) list. Your findings might have already been reported.
2. If you're unable to find it in the existing issues list, open a new issue with a relevant bug report template if possible.
3. Add relevant labels
4. Ensure that you have added:
    - Descriptive title
    - Clear bug description
    - Steps to reproduce
    - Examples, code samples or screenshots
    - Expected and actual behaviors
    - GherLint version you are using
    - As much relevant information as possible

_:information_source: While creating a bug report, your goal should be to make it easy for yourself and others to reproduce the bug and figure out the fixes_.

### Feature Request

The guidelines in this section can be used to create enhancement and new feature request tickets.

Have cool enhancement or great feature requests? Then check the following guidelines to request one:

1. Search in the existing [list](https://github.com/gherlint/gherlint/issues) and make sure your idea has not been reported already.
2. Open a new issue with a relevant template.
3. Add as much information as possible. Some valuable information might be:
    - Descriptive title
    - Clear description of the request
    - What value does it bring to the GherLint?
    - Code examples or screenshots

### Pull Request

Please follow these guidelines when creating any type of Pull Requests:

1. Provide clear and concise description
2. Link PR to issues you are working on
3. Make a PR **draft** if you are still working on it
4. Add reviewers for code reviews (if possible) after PR is **Ready for review**
5. Make sure all the checks are passing
6. Re-request reviewers, after addressing their reviews

**Your PR is merged!** :tada:Congratulations:tada: And thank you for your valuable effort.

### Git Commit Message

We strongly recommend that you follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification while writing git commit messages.

Quick summary of the specification:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Some commit message examples:

```
feat: allow config extension
feat(rule): add no_white_space rule
docs: fix typo in README
```

Some of the types that can be used:

```bash
[
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'refactor',
  'revert',
  'style',
  'test'
];
```

Key points:

-   Use the present tense
    ```diff
    -feat: added feature
    +feat: add feature
    ```
-   Use the imperative mood
    ```diff
    -feat: adds feature
    +feat: add feature
    ```
-   Make it short and descriptive
-   **Sign your commit**

WE ENCOURAGE YOU TO BECOME PART OF US. THANKS :heart:
