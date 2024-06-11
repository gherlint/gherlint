### PRE-RELEASE

-   [ ] update [CHANGELOG.md](https://github.com/gherlint/gherlint/blob/main/CHANGELOG.md)
-   [ ] bump version to `1.0.0-rc.x`
    -   `package.json`
    -   `CHANGELOG.md`
-   [ ] check successful CI runs
-   [ ] create rc tag `v1.0.0-rc.x`
    -   [ ] successful CI run

**QA**

-   [ ] [changelog](https://github.com/gherlint/gherlint/releases) testing
-   [ ] installation: `npm i @gherlint/gherlint`
-   [ ] check/Test available command options:
    -   [ ] `npx gherlint --help` - shows all available options
    -   [ ] `npx gherlint --version` - check version is correct
-   [ ] check different feature paths: `npx gherlint <path>`
    -   [ ] single file (`features/login.feature`)
    -   [ ] folder (`features`)
    -   [ ] glob pattern (`features/**/*.feature`)
-   [ ] check --fix option fixes the fixable lint problems
    -   [ ] `npx gherlint --fix <path-to-feature-file>`
-   [ ] run linter on test feature file(s) - (create feature file(s) to check all available rules)
-   [ ] check config file can be used:
    -   [ ] `.gherlintrc`
    -   [ ] `.gherlintrc.json`
    -   [ ] `.gherlintrc.js`
    -   [ ] multiple config files in the project root - check for message
-   [ ] modify between different lint severity levels (`error`, `warn`, `off`) - check for respective lint reports

### RELEASE

-   [ ] update CHANGELOG.md (add changelog for fixes/patches if any)
-   [ ] bump version to `1.0.0`
    -   `package.json`
    -   `CHANGELOG.md`
-   [ ] create release tag `v1.0.0`
    -   [ ] successful CI run
