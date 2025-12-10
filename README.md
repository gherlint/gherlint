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

All rules can be switched to one of these levels: `off`, `warn`, `error`.
e.g. to make the linter fail on indentation problems, show only a warning for grammar issues and ignore the lowercase titles rule set:
```
{
    "rules": {
        "indentation": "error",
        "grammar_check": "warn"
        "lowercase_title": "off",
        ...
    }
}
```

Some rules can take extra parameters as options. For that the value in the setting object needs to become an array. The first item in the array is always the level (`off`, `warn`, `error`) and the following items are other options.
Please note that the order in that array matters. Every option has to be in the right place.
These rules can take extra options:

**indentation**
1. level `string`
2. required spaces for every indent step `int`

e.g. `"indentation": ["error", 4]`

**newline_before_scenario**
1. level `string`
2. required new lines before each scenario `int`
3. count tag and comment as newline `boolean`

e.g. `"newline_before_scenario": ["error", 4, false]`

**grammar_check**
1. level `string`
2. dialect `string` `American | British | Australian | Canadian`
3. words to import into the dictionary `string[]`
4. rules to switch on or off `object` with the [name of the rule](https://writewithharper.com/docs/rules) as key and `false|true` as value
5. strings to replace `string[][]` where the inner array has two items, first being the search value and the second the replacement value.

e.g.
```
"grammar_check": [
  "warn",
  "American",
  ["JankariTech", "GmbH"],
  {
     "ExpandMinimum": false,
     "ExpandTimeShorthands": false,
  },
  [
    [ "\\n", " " ],
    [ "~", "" ]
  ]
```

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
