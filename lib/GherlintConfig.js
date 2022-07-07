const { join, basename, extname } = require("path");
const fs = require("fs");
const glob = require("glob");
const { isEmpty, merge, difference, keys } = require("lodash");

const log = require("./logging/logger");
const { isDir, cwd, searchFeatureFiles } = require("./Path");
const {
    configFilePattern,
    gherlintrc: defaultGherlintrc,
} = require("./defaults");
const Fs = require("./Fs");
const ruleOptions = require("./rules/_ruleOptions");

module.exports = class GherlintConfig {
    exitCode = 0;

    static get CONFIG_FILE_NAME() {
        return ".gherlintrc";
    }

    static get CONFIG_EXTENSION() {
        return Object.freeze({ json: ".json", js: ".js" });
    }

    constructor(cliOptions = {}) {
        this.cliOptions = cliOptions;

        this.configFilePattern = configFilePattern;
        this.defaultConfig = defaultGherlintrc;
        this.configFile = null;
        this.configuration = null;
        this.files = [];

        this.#setup();
    }

    #setup() {
        this.configFile = this.#getConfigFile();
        if (this.configFile) {
            this.configuration = this.#readConfigFromFile(this.configFile);
        }
        if (!this.configuration) {
            this.configuration = this.getDefaultConfig();
        }

        this.configuration = this.#overrideByCliConfig(
            this.configuration,
            this.cliOptions.cliConfig
        );

        // attach cliOptions to configuration
        delete this.cliOptions.cliConfig;
        this.configuration.cliOptions = this.cliOptions;

        this.files = this.#listFeatureFiles(this.configuration.files);
    }

    #hasCliConfigFileOption() {
        return this.cliOptions.config ? true : false;
    }

    #getConfigFile() {
        if (this.configFile) return this.configFile;

        if (this.#hasCliConfigFileOption()) {
            if (isDir(this.cliOptions.config)) {
                log.error(
                    "'-c, --config' option takes file only.",
                    "Usage:",
                    "gherlint -c path/to/.gherlintrc"
                );
            }

            return this.cliOptions.config;
        } else {
            return this.#searchConfigFile();
        }
    }

    #searchConfigFile() {
        const matches = glob.sync(join(cwd(), this.getConfigFilePattern()), {
            absolute: true,
        });

        if (matches.length === 1) return matches[0];

        if (matches.length > 1) {
            log.info("Found multiple config files:", matches.join("\n  "));
            log.info(`Using config file '${basename(matches[0])}'`);
            return matches[0];
        }
        return null;
    }

    #readConfigFromFile(configFile) {
        let config = {};

        if (configFile) {
            const extension = extname(basename(configFile));
            try {
                if (
                    extension === "" &&
                    extension !== GherlintConfig.CONFIG_EXTENSION.json
                ) {
                    config = JSON.parse(Fs.readFile(configFile));
                } else if (extension === GherlintConfig.CONFIG_EXTENSION.js) {
                    config = require(configFile);
                }
            } catch (err) {
                log.error(
                    "Invalid config file!",
                    `${basename(configFile)}: ${err.message}`
                );
            }

            if (!isEmpty(config)) {
                this.#validateConfig(config);

                config = this.#mergeWithDefaultConfig(
                    this.getDefaultConfig(),
                    config
                );
            }
        }
        return config;
    }

    #listFeatureFiles(patterns) {
        if (typeof patterns === "string") patterns = [patterns];

        return patterns.reduce(function (files, pattern) {
            files.push(...searchFeatureFiles(pattern));
            return files;
        }, []);
    }

    #mergeWithDefaultConfig(defaultConfig, userConfig) {
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

    #overrideByCliConfig(config, cliConfig = {}) {
        return { ...config, ...cliConfig };
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
                `[${basename(this.configFile)}] Invalid rules!`,
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
        return this.defaultConfig;
    }

    getConfigFilePattern() {
        return this.configFilePattern;
    }

    initializeConfig() {
        log.info("Initializing config file...");

        const configPath = join(cwd(), GherlintConfig.CONFIG_FILE_NAME);
        const config = JSON.stringify(this.getDefaultConfig(), null, 4);

        return new Promise(function (resolve, reject) {
            fs.writeFile(configPath, config, function (err) {
                if (err) {
                    log.error("Cannot create config file!", err.message);
                    reject(1);
                }
                log.success("Config file initialized!");
                resolve(0);
            });
        });
    }
};
