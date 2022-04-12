const { join, basename, extname } = require("path");
const fs = require("fs");
const glob = require("glob");
const { isEmpty, merge, difference, keys } = require("lodash");
const minimatch = require("minimatch");

const log = require("./logging/logger");
const { isDir } = require("./path");
const { getCwd } = require("./environment");
const Parser = require("./parser");
const {
    configFilePattern,
    gherlintrc: defaultGherlintrc,
} = require("./defaults");
const ruleOptions = require("./rules/_ruleOptions");

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
                log.error(
                    "'-c, --config' option takes file only.",
                    "Usage: gherlint -c path/to/.gherlintrc"
                );
            }
            this.#validateConfigFile(this.cliOptions.config);

            this.configFile = this.cliOptions.config;
        } else {
            this.configFile = this.#searchConfigFile();
        }

        if (!this.configFile) {
            log.info(
                "Gherlint config file not found. Using default config.",
                "Create config file with:",
                "gherlint --init"
            );
        }

        return this.configFile;
    }

    #validateConfigFile(file) {
        if (!minimatch(basename(file), this.getConfigFilePattern())) {
            log.error(
                `Invalid config file "${basename(file)}"`,
                "Allowed: '.gherlintrc', '.gherlintrc.json' or '.gherlintrc.js'"
            );
        }
        return true;
    }

    #searchConfigFile() {
        const matches = glob.sync(join(getCwd(), this.getConfigFilePattern()), {
            absolute: true,
        });

        if (matches.length === 1) return matches[0];

        if (matches.length > 1) {
            log.info("Found multiple config files:", matches.join("\n  "));
            log.info(`Using config file '${basename(matches[0])}'`);
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
                log.error(
                    "Invalid config file!",
                    `${basename(this.configFile)}: ${err.message}`
                );
            }
        } else if (this.configFile) {
            try {
                userConfig = require(this.configFile);
            } catch (err) {
                log.error(
                    "Invalid config file!",
                    `${basename(this.configFile)}: ${err.message}`
                );
            }
        }

        if (!isEmpty(userConfig)) {
            this.#validateConfig(userConfig);
            this.config = this.#mergeConfig(this.config, userConfig);
        }
    }

    #mergeConfig(defaultConfig, userConfig) {
        const mergedRules = {};
        keys(userConfig.rules || {}).forEach((rule) => {
            if (typeof userConfig.rules[rule] === "string") {
                mergedRules[rule] = [
                    userConfig.rules[rule],
                    defaultConfig.rules[rule][1],
                ];
            } else if (userConfig.rules[rule].length === 1) {
                mergedRules[rule] = [
                    userConfig.rules[rule][0],
                    defaultConfig.rules[rule][1],
                ];
            } else {
                mergedRules[rule] = [
                    userConfig.rules[rule][0],
                    userConfig.rules[rule][1],
                ];
            }
        });
        const mergedConfig = merge(defaultConfig, userConfig);
        mergedConfig.rules = { ...mergedConfig.rules, ...mergedRules };

        return mergedConfig;
    }

    #validateConfig(config) {
        const invalidProps = difference(
            keys(config),
            keys(this.getDefaultConfig())
        );

        if (!isEmpty(invalidProps))
            log.error(
                `[${basename(this.configFile)}] Invalid config properties!`,
                invalidProps.join(", ")
            );

        if (config.rules) {
            this.#validateRules(config.rules);
        }
    }

    #validateRules(rules) {
        const invalidRules = difference(
            keys(rules),
            keys(this.getDefaultConfig().rules)
        );

        if (!isEmpty(invalidRules))
            log.error(
                `[${basename(this.configFile)}] Invalid lint rules!`,
                invalidRules.join(", ")
            );

        for (const rule in rules) {
            if (typeof rules[rule] === "string") {
                if (!ruleOptions.includes(rules[rule])) {
                    log.error(
                        `[${basename(this.configFile)}] Invalid rule value!`,
                        `[RULE] ${rule}: ${
                            rules[rule]
                        }\n  Expected one of these: ${ruleOptions.join(", ")}`
                    );
                }
            } else if (rules[rule] instanceof Array) {
                if (rules[rule].length > 2) {
                    log.error(
                        `[${basename(
                            this.configFile
                        )}] Invalid rule value (expected 2 elements, but got ${
                            rules[rule].length
                        })`,
                        `[RULE] ${rule}: ${rules[rule].join(", ")}`
                    );
                } else {
                    if (!ruleOptions.includes(rules[rule][0])) {
                        log.error(
                            `[${basename(
                                this.configFile
                            )}] Invalid rule value!`,
                            `[RULE] ${rule}: ${
                                rules[rule][0]
                            }\n  Expected one of these: ${ruleOptions.join(
                                ", "
                            )}`
                        );
                    }
                }
            } else {
                log.error(
                    "Invalid rule value (expected String or Array)",
                    `[RULE] ${rule}: ${rules[rule]}`
                );
            }
        }
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
                if (err) log.error("Cannot create config file!", err.message);
                log.success("Config file created!");
            }
        );
    }
};
