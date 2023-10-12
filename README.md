# GherLint

GherLint, a tool for checking patterns on Gherkin files.

## Installation

Using npm:

```bash
npm install -D @gherlint/gherlint
```

Using yarn:

```bash
yarn add -D @gherlint/gherlint
```

## Usage

```bash
npx gherlint features/
```

Apply fix with `--fix` option.

```bash
npx gherlint --fix features/
```

## Configuration

GherLint supports configuring rules and other options via a config file. We support the following config file formats:

> NOTE: Priority is given to the config file in the following order:

```
.gherlintrc
.gherlintrc.js
.gherlintrc.json
```

See [Configuration](lib/config/gherlintrc.js) for defaults.

## Code of Conduct

GherLint adheres to this [Code of Conduct](CODE_OF_CONDUCT.md).

## Contributing

Please make sure to read our [Contributing Guide](CONTRIBUTING.md) before making a pull request.

### Feature Request / Bug Report

Please make sure to follow the issue templates when opening an issue.

For a feature request, use this template: [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md).

For a bug report, use this template: [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md).

### Adding New Rule

If you want to contribute by adding a new rule, please follow the [Adding New Rule](docs/adding_new_rule.md) guide.

## License

[MIT License](LICENSE)
