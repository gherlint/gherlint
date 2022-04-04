const { join, basename, extname } = require("path");
const glob = require("glob");
const { merge, isEmpty } = require("lodash");
const minimatch = require("minimatch");

const Parser = require("../parser");
const Rules = require("../rules");
const { getCwd } = require("../environment");
const { isDir } = require("../path");
const {
    configFilePattern,
    gherlintrc: defaultGherlintrc,
} = require("../../defaults");

module.exports = class Linter {
    constructor(options) {
        this.configuration = defaultGherlintrc;
        this.cliOptions = options;
        this.parseConfigFile();
    }

    async lintFiles(files) {
        for (const file of files) {
            const ast = await Parser.parse(file);

            // Run rules
            Object.keys(Rules).forEach((rule) => {
                Rules[rule].run(ast);
            });
        }
    }

    getConfigFile() {
        const configFilePath = this.cliOptions.config
            ? this.cliOptions.config
            : configFilePattern;

        if (this.cliOptions.config && isDir(this.cliOptions.config)) {
            console.error(`"-c, --config" option takes a file only.`);
            return;
        }

        const match = glob.sync(join(getCwd(), configFilePath), {
            absolute: true,
        });

        if (this.cliOptions.config) {
            if (!match.length) {
                console.error(
                    `Config file not found in "${this.cliOptions.config}"`
                );
                return;
            } else if (!minimatch(basename(match[0]), configFilePattern)) {
                console.error(
                    `Invalid config file: "${this.cliOptions.config}"`
                );
                return;
            }
        }

        return Boolean(match.length) ? match[0] : "";
    }

    parseConfigFile() {
        const configFile = this.getConfigFile();
        let userConfig = {};

        if (configFile && extname(basename(configFile)) !== ".js") {
            try {
                userConfig = JSON.parse(Parser.readFile(configFile));
            } catch (err) {
                console.error(err);
            }
        } else if (configFile) {
            userConfig = require(configFile);
        }

        if (!isEmpty(userConfig)) {
            this.validateConfig(userConfig);
        }

        merge(this.configuration, userConfig);
    }

    validateConfig(config) {
        // TODO: validate users config
    }

    async lintText(text) {}
};
