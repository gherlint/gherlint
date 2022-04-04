const { join } = require("path");
const glob = require("glob");
const { merge } = require("lodash");

const Parser = require("../parser");
const Rules = require("../rules");
const { getCwd } = require("../environment");
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
        const match = glob.sync(join(getCwd(), configFilePattern), {
            absolute: true,
        });

        return Boolean(match.length) ? match[0] : "";
    }

    parseConfigFile() {
        const configFile = this.getConfigFile();
        let userConfig;

        if (configFile) {
            try {
                userConfig = JSON.parse(Parser.readFile(configFile));
                this.validateConfig(userConfig);
            } catch (err) {
                throw new Error(err);
            }
        }
        merge(this.configuration, userConfig);
    }

    validateConfig(config) {
        //
    }

    async lintText(text) {}
};
