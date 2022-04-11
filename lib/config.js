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
                log.error("'-c, --config' option takes file only.");
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
                `Invalid config properties:\n  ${invalidProps.join(", ")}`
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
            log.error(`Invalid rules:\n  ${invalidRules.join(", ")}`);

        for (const rule in rules) {
            if (typeof rules[rule] === "string") {
                if (!ruleOptions.includes(rules[rule])) {
                    const msg = ["Invalid rule value:"];
                    msg.push(`  ${rule}: ${rules[rule]}`);
                    msg.push(
                        `Expected one of these: ${ruleOptions.join(", ")}`
                    );
                    log.error(msg.join("\n"));
                }
            } else if (rules[rule] instanceof Array) {
                if (rules[rule].length > 2) {
                    log.error(
                        `Invalid rule value: (expected 2 elements, but got ${rules[rule].length})\n  ${rules[rule]}`
                    );
                } else {
                    if (!ruleOptions.includes(rules[rule][0])) {
                        log.error(
                            `Invalid rule value: ${
                                rules[rule]
                            }\nExpected one of these: ${ruleOptions.join(", ")}`
                        );
                    }
                }
            } else {
                log.error(
                    `Invalid rule value: (expected String or Array)\n  ${rule}: ${rules[rule]}`
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
                if (err) log.error(err);
                log.info("Finished!");
            }
        );
    }
};
