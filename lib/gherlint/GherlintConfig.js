const { join, basename, extname } = require("path");
const fs = require("fs");
const glob = require("glob");
const { isEmpty, merge, difference, keys } = require("lodash");

const log = require("../logging/logger");
const { isDir, cwd } = require("../../utils/Path");
const {
    configFilePattern,
    gherlintrc: defaultGherlintrc,
} = require("../config");
const Fs = require("../../utils/Fs");
const ruleOptions = require("../rules/_ruleOptions");

module.exports = class GherlintConfig {
    #configFilePattern = null;
    #defaultConfig = null;

    static get CONFIG_FILE_NAME() {
        return ".gherlintrc";
    }

    static get FEATURE_FILE_EXTENSION() {
        return ".feature";
    }

    static get CONFIG_EXTENSION() {
        return Object.freeze({ json: ".json", js: ".js" });
    }

    constructor(cliOptions = {}) {
        this.cliOptions = cliOptions;

        this.#configFilePattern = configFilePattern;
        this.#defaultConfig = defaultGherlintrc;
        this.configFilePath = null;
        this.configuration = {};
        this.featureFiles = [];
    }

    init() {
        let config = {};
        this.configFilePath = this.getConfigFilePath();

        if (this.configFilePath) {
            config = this.readConfigFromFile(this.configFilePath);
            this.validateConfig(config);
        }

        config = this.mergeWithDefaultConfig(config);

        // override configuration by cli options
        this.configuration = this.overrideByCliConfig(config, this.cliOptions);

        this.featureFiles = this.getFeatureFiles(this.configuration.files);

        // Todo: implement ignorePatterns

        // remove properties related to files
        delete this.configuration.files;
        delete this.configuration.ignorePatterns;
    }

    #hasCliConfigFileOption() {
        return this.cliOptions.config ? true : false;
    }

    getConfigFilePath() {
        if (this.configFilePath) return this.configFilePath;

        // override config options from cli option if provided
        if (this.#hasCliConfigFileOption()) {
            if (isDir(this.cliOptions.config)) {
                log.error(
                    "'-c, --config' option takes file only.",
                    "Usage:",
                    "gherlint -c path/to/.gherlintrc"
                );
            }
            return this.cliOptions.config;
        }

        return this.searchConfigFile();
    }

    searchConfigFile() {
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

    readConfigFromFile(configFile) {
        let config = {};

        if (configFile) {
            const extension = extname(basename(configFile));
            try {
                // parse config file based on its extension
                // if extension is empty or .json, try to parse it as json
                // if extension is .js, try to require it
                if (
                    extension === "" ||
                    extension === GherlintConfig.CONFIG_EXTENSION.json
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
        }
        return config;
    }

    getFeatureFiles(patterns) {
        if (!patterns) return [];

        if (typeof patterns === "string") patterns = [patterns];

        // NOTE: callback function MUST be an arrow function
        return patterns.reduce((files, pattern) => {
            files.push(...this.#listFeatureFiles(pattern));
            return files;
        }, []);
    }

    #listFeatureFiles(pattern, files = []) {
        glob.sync(pattern, { absolute: true, cwd: cwd() }).map((match) => {
            if (isDir(match)) {
                return this.#listFeatureFiles(`${match}/*`, files);
            }
            if (extname(match) === GherlintConfig.FEATURE_FILE_EXTENSION) {
                return files.push(match);
            }
        });
        return files;
    }

    mergeWithDefaultConfig(userConfig) {
        const mergedRules = {};
        keys(userConfig.rules || {}).forEach((rule) => {
            if (typeof userConfig.rules[rule] === "string") {
                mergedRules[rule] = userConfig.rules[rule];
            } else {
                mergedRules[rule] = [...userConfig.rules[rule]];
            }
        });
        const mergedConfig = merge({}, this.getDefaultConfig(), userConfig);
        mergedConfig.rules = { ...mergedConfig.rules, ...mergedRules };

        return mergedConfig;
    }

    overrideByCliConfig(config, cliConfig = {}) {
        return { ...config, ...cliConfig };
    }

    validateConfig(config) {
        const userConfigKeys = keys(config);
        const defaultConfigKeys = keys(this.getDefaultConfig());

        const invalidProps = difference(userConfigKeys, defaultConfigKeys);

        if (!isEmpty(invalidProps))
            log.error(
                `[${basename(this.configFilePath)}] Invalid config properties!`,
                invalidProps.join(", ")
            );

        // validate root config properties type
        userConfigKeys.forEach((key) => {
            let type = typeof this.getDefaultConfig()[key];
            if (typeof config[key] !== type) {
                log.error(
                    `[${basename(
                        this.configFilePath
                    )}] Invalid config value. Must of type '${type}'`,
                    key
                );
            }
            if (type === "object") {
                type =
                    this.getDefaultConfig()[key] instanceof Array
                        ? "array"
                        : "object";
                if (
                    this.getDefaultConfig()[key] instanceof Object !==
                        config[key] instanceof Object ||
                    this.getDefaultConfig()[key] instanceof Array !==
                        config[key] instanceof Array
                ) {
                    log.error(
                        `[${basename(
                            this.configFilePath
                        )}] Invalid config value. Must of type '${type}'`,
                        key
                    );
                }
            }
        });

        if (config.rules) {
            this.validateRules(config.rules);
        }
    }

    validateRules(rules) {
        const invalidRules = difference(
            keys(rules),
            keys(this.getDefaultConfig().rules)
        );

        if (!isEmpty(invalidRules))
            log.error(
                `[${basename(this.configFilePath)}] Invalid rules!`,
                invalidRules.join(", ")
            );

        for (const rule in rules) {
            if (typeof rules[rule] === "string") {
                if (!ruleOptions.includes(rules[rule])) {
                    log.error(
                        `[${basename(
                            this.configFilePath
                        )}] Invalid rule value!`,
                        `[RULE] ${rule}: ${
                            rules[rule]
                        }\n  Expected one of these: ${ruleOptions.join(", ")}`
                    );
                }
            } else if (rules[rule] instanceof Array) {
                if (rules[rule].length > 2) {
                    log.error(
                        `[${basename(
                            this.configFilePath
                        )}] Invalid rule value (expected 2 elements, but got ${
                            rules[rule].length
                        })`,
                        `[RULE] ${rule}: ${rules[rule].join(", ")}`
                    );
                } else {
                    if (!ruleOptions.includes(rules[rule][0])) {
                        log.error(
                            `[${basename(
                                this.configFilePath
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
        return this.#defaultConfig;
    }

    getConfigFilePattern() {
        return this.#configFilePattern;
    }

    // Todo: implement initialization option
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
