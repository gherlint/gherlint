# Adding New Rule

> The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

Rule can be simply defined as the convention to be followed while writing the feature file in Gherkin language. The purpose of defining rules is to standardize the feature files written by different teams or individuals. Ultimately, they helps to maintain the well organized and readable scenarios within a feature file.

## Creating a Rule File

Rules are written in JavaScript and they are defined in the following directory:

> NOTE: A rule filename **MUST** follow **snake_case** naming convention.

```bash
📦gherlint
 ┣ 📂lib
 ┃ ┗ 📂rules
 ┃   ┣ 📜 indentation.js
 ┃   ┣ 📜 my_new_rule.js
 ┃   ┗ 📒 index.js
```

Once the rule is created, it needs to be registered to the list of rules in the `index.js` file.

```js
{
    ...
    Rules: {
        ...
        my_new_rule: require('./my_new_rule')
    }
}
```

## Writing a Rule

A rule has the following guidelines:

-   **MUST** be a class
-   **SHOULD** extends the `Rule` class
-   **MUST** implement a statc method called `run`

### Rule Metadata

A rule class **SHOULD** have the following metadata as a static class member:

```js
class MyNewRule extends Rule {
    static meta = {
        ruleId: "my_new_rule",
        message: "Message on rule violation",
        type: "warn", // (warn | error | off)
        hasFix: false, // (true | false) - if the rule has a fixer or not
    };
}
```

### static run()

The `run` method is the entry point of the rule. It **MUST** take gherkin AST as an argument and **MUST** return an array of [lint problems](#lint-problem-schema).

```js
    static run(ast) {
        // do something with the gherkin AST
        // and push the problems to the problems array
        return lintProblems;
    }
```

### Lint Problem Schema

A single lint problem is an object and **MUST** have the following schema:

```js
{
    ruleId: string <meta.ruleId>,
    type: string <meta.type>,
    message: string <meta.message>,
    location: { column: number, line: number },
}
```

If a rule is fixable and has a fixer, then the lint problem **MUST** have these properties as well:

> Also, don't forget to state that the rule has a fixer in `meta.hasFix`

```js
{
    ...
    /**
     * [Optional]
     */
    fixData: {
        // necessary data for the fixer
    },

    /**
     * A fixer function
     */
    applyFix: function(text, problem) {
        // apply fix to the problem
        return fixedText;
    }
}
```

Parameters:

`text`: The text content of the feature file

`problem`: The lint problem object (itself)

A fixer function applies the fix to the text and **MUST** return the fixed text. It **MUST** be used to only fix the problem it is associated with.

Finally, export the rule class.
