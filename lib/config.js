const { join, basename, extname } = require("path");
const fs = require("fs");
const glob = require("glob");
const { isEmpty, merge } = require("lodash");

const log = require("./logging/logger");
const { isDir } = require("./path");
const { getCwd } = require("./environment");
const Parser = require("./parser");
const {
    configFilePattern,
    gherlintrc: defaultGherlintrc,
} = require("../defaults");

module.exports = class Config {
    constructor(cliOptions = {}) {
        this.defaultConfigName = ".gherlintrc";
        this.configFile = null;
        this.config = this.getDefaultConfig();
        this.cliOptions = cliOptions;
    }

    #hasCliConfigOption() {
        return this.cliOptions.config ? true : false;
    }

    #getConfigFile() {
        if (this.configFile) return this.configFile;

        if (this.#hasCliConfigOption()) {
            if (isDir(this.cliOptions.config)) {
                log.error('"-c, --config" option takes file only.');
            }
            this.#validateConfigFile(this.cliOptions.config);

            this.configFile = this.cliOptions.config;
        } else {
            this.configFile = this.#searchConfigFile();
        }

        if (!this.configFile) {
            log.info(
                ".gherlintrc config file not found. Using default config."
            );
        }

        return this.configFile;
    }

    #validateConfigFile(file) {
        if (!minimatch(basename(file), this.getConfigFilePattern())) {
            log.error(`Invalid config file "${basename(file)}"`);
        }
        return true;
    }

    #searchConfigFile() {
        const matches = glob.sync(join(getCwd(), this.getConfigFilePattern()), {
            absolute: true,
        });

        if (matches.length === 1) return matches[0];

        if (matches.length > 1) {
            log.info(`Found multiple config files:\n${matches.join("\n")}`);
            log.info(`Using config file ${basename(matches[0])}`);
            return matches[0];
        } else return null;
    }

    #readConfigFile() {
        this.#getConfigFile();
        let userConfig = {};

        if (this.configFile && extname(basename(this.configFile)) !== ".js") {
            try {
                userConfig = JSON.parse(Parser.readFile(this.configFile));
            } catch (err) {
                log.error(err.message);
            }
        } else if (this.configFile) {
            userConfig = require(this.configFile);
        }

        if (!isEmpty(userConfig)) {
            this.#validateConfig(userConfig);
            this.config = merge(this.config, userConfig);
        }
    }

    #validateConfig(config) {
        // TODO: validate users config
    }

    getDefaultConfig() {
        return defaultGherlintrc;
    }

    getConfigFilePattern() {
        return configFilePattern;
    }

    getConfig() {
        if (this.configFile) {
            return this.config;
        }

        this.#readConfigFile();
        return this.config;
    }

    initConfig() {
        log.info("Initializing config file...");
        return fs.writeFile(
            join(getCwd(), this.defaultConfigName),
            JSON.stringify(this.getDefaultConfig(), null, 4),
            (err) => {
                if (err) log.error(err);
                log.info("Finished!");
            }
        );
    }
};
