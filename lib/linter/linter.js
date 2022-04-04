const { join, basename } = require("path");
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

    getConfigFile(filePath) {
        const configFilePath = filePath ? filePath : configFilePattern;
        const match = glob.sync(join(getCwd(), configFilePath), {
            absolute: true,
        });

        // TODO: check file extension
        // if(basename(match[0]))

        return Boolean(match.length) ? match[0] : "";
    }

    parseConfigFile() {
        let configFile, userConfig;

        if (this.cliOptions.config) {
            configFile = this.getConfigFile(this.cliOptions.config);
        } else {
            configFile = this.getConfigFile();
        }

        if (configFile) {
            try {
                // TODO: JSON parse if the file is json
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
