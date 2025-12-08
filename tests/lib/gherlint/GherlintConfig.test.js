const path = require("path");
const { cloneDeep } = require("lodash");

const tmpCwd = "/myproject";
const fixturesPath = path.resolve(
    path.join(__dirname, "../", "../", "__fixtures__", "gherlintConfigs")
);

// mock modules
jest.mock("../../../lib/logging/logger", () => {
    const logger = jest.requireActual("../../../lib/logging/logger");
    logger.log = (msg) => msg;
    return logger;
});
jest.mock("fs", () => {
    const fs = jest.requireActual("fs");
    const { ufs } = require("unionfs");
    return ufs.use(fs);
});
process.cwd = () => tmpCwd;

const fs = require("fs");
const { Volume } = require("memfs");
const GherlintConfig = require("../../../lib/gherlint/GherlintConfig");
const logger = require("../../../lib/logging/logger");
const {
    gherlintrc: defaultConfig,
    configFilePattern,
} = require("../../../lib/config");

describe("class: GherlintConfig", () => {
    let spyLog;

    beforeEach(() => {
        spyLog = jest.spyOn(logger, "log");
    });

    afterEach(() => {
        spyLog.mockClear();
    });

    describe("init config", () => {
        let spyGetConfigFilePath,
            spyReadConfigFromFile,
            spyValidateConfig,
            spyMergeWithDefaultConfig,
            spyOverrideByCliConfig,
            spyGetFeatureFiles;

        beforeAll(() => {
            spyGetConfigFilePath = jest
                .spyOn(GherlintConfig.prototype, "getConfigFilePath")
                .mockReturnValue("path/to/config/.gherlintrc");
            spyReadConfigFromFile = jest
                .spyOn(GherlintConfig.prototype, "readConfigFromFile")
                .mockReturnValue({});
            spyValidateConfig = jest.spyOn(
                GherlintConfig.prototype,
                "validateConfig"
            );
            spyMergeWithDefaultConfig = jest.spyOn(
                GherlintConfig.prototype,
                "mergeWithDefaultConfig"
            );
            spyOverrideByCliConfig = jest.spyOn(
                GherlintConfig.prototype,
                "overrideByCliConfig"
            );
            spyGetFeatureFiles = jest.spyOn(
                GherlintConfig.prototype,
                "getFeatureFiles"
            );
        });

        afterAll(() => {
            jest.restoreAllMocks();
        });

        describe("init: with config file", () => {
            it("should call config methods", () => {
                new GherlintConfig({}).init();

                expect(spyGetConfigFilePath).toHaveBeenCalledTimes(1);
                expect(spyReadConfigFromFile).toHaveBeenCalledTimes(1);
                expect(spyValidateConfig).toHaveBeenCalledTimes(1);
                expect(spyMergeWithDefaultConfig).toHaveBeenCalledTimes(1);
                expect(spyOverrideByCliConfig).toHaveBeenCalledTimes(1);
                expect(spyGetFeatureFiles).toHaveBeenCalledTimes(1);
            });
        });

        describe("init: without config file", () => {
            beforeAll(() => {
                spyGetConfigFilePath = jest
                    .spyOn(GherlintConfig.prototype, "getConfigFilePath")
                    .mockReturnValue(null);
            });

            it("should call default config methods", () => {
                new GherlintConfig({}).init();

                expect(spyGetConfigFilePath).toHaveBeenCalledTimes(1);
                expect(spyReadConfigFromFile).toHaveBeenCalledTimes(0);
                expect(spyValidateConfig).toHaveBeenCalledTimes(0);
                expect(spyMergeWithDefaultConfig).toHaveBeenCalledTimes(1);
                expect(spyOverrideByCliConfig).toHaveBeenCalledTimes(1);
                expect(spyGetFeatureFiles).toHaveBeenCalledTimes(1);
            });
        });

        it("should not have file related properties", () => {
            const config = new GherlintConfig({});
            config.init();

            expect(config.configuration).not.toHaveProperty("files");
            expect(config.configuration).not.toHaveProperty("ignorePatterns");
        });
    });

    describe("public methods", () => {
        describe("getConfigFilePath", () => {
            let spySearchConfigFile, spyOnExit;
            beforeAll(() => {
                spySearchConfigFile = jest
                    .spyOn(GherlintConfig.prototype, "searchConfigFile")
                    .mockReturnValue(null);
                spyOnExit = jest
                    .spyOn(process, "exit")
                    .mockImplementation(() => {
                        throw new Error("process.exit");
                    });
            });

            afterAll(() => {
                jest.restoreAllMocks();
            });

            it("no configFilePath", () => {
                const config = new GherlintConfig({});
                config.getConfigFilePath();

                expect(spySearchConfigFile).toHaveBeenCalledTimes(1);
            });
            it("configFilePath is set", () => {
                const config = new GherlintConfig({});
                config.configFilePath = "path/to/config/.gherlintrc";
                config.getConfigFilePath();

                expect(spySearchConfigFile).toHaveBeenCalledTimes(0);
            });

            describe("config override from cli", () => {
                it("should return error if the config path doesn't exist", () => {
                    const configPath = "custom/.gherlintrc";
                    const config = new GherlintConfig({
                        config: configPath,
                    });

                    expect(() => config.getConfigFilePath()).toThrow();
                    expect(spyOnExit).toHaveBeenCalledWith(1);
                    expect(spySearchConfigFile).toHaveBeenCalledTimes(0);
                    expect(spyLog).toHaveBeenCalledTimes(1);
                    expect(spyLog).toHaveReturnedWith([
                        `ENOENT: no such file or directory, stat '${configPath}'`,
                    ]);
                });
                it("should return error if the path is a directory", () => {
                    const vfs = createVfs({ "custom/.gherlintrc": "{}" });
                    fs.use(vfs);

                    const config = new GherlintConfig({
                        config: `${tmpCwd}/custom`,
                    });

                    expect(() => config.getConfigFilePath()).toThrow();
                    expect(spyOnExit).toHaveBeenCalledWith(1);
                    expect(spySearchConfigFile).toHaveBeenCalledTimes(0);
                    expect(spyLog).toHaveBeenCalledTimes(1);
                    expect(spyLog).toHaveReturnedWith([
                        "'-c, --config' option takes file only.",
                        "Usage:",
                        "gherlint -c path/to/.gherlintrc",
                    ]);

                    // reset vfs
                    vfs.reset();
                });
                it("should return the config provided in cli option", () => {
                    const vfs = createVfs({ ".gherlintrc": "{}" });
                    fs.use(vfs);

                    const config = new GherlintConfig({
                        config: `${tmpCwd}/.gherlintrc`,
                    });

                    expect(config.getConfigFilePath()).toStrictEqual(
                        `${tmpCwd}/.gherlintrc`
                    );
                    expect(spySearchConfigFile).toHaveBeenCalledTimes(0);

                    // reset vfs
                    vfs.reset();
                });
            });
        });

        describe("searchConfigFile", () => {
            it("no config file", () => {
                const config = new GherlintConfig({});

                expect(config.searchConfigFile()).toEqual(null);
            });
            it.each([
                [
                    ".gherlintrc - single",
                    ".gherlintrc",
                    { ".gherlintrc": "{}" },
                    [],
                ],
                [
                    ".gherlintrc.json - single",
                    ".gherlintrc.json",
                    { ".gherlintrc.json": "{}" },
                    [],
                ],
                [
                    ".gherlintrc.js - single",
                    ".gherlintrc.js",
                    { ".gherlintrc.js": "{}" },
                    [],
                ],
                [
                    ".gherlintrc - multiple",
                    ".gherlintrc",
                    {
                        ".gherlintrc.json": "{}",
                        ".gherlintrc": "{}",
                        ".gherlintrc.js": "{}",
                    },
                    [
                        [
                            "Found multiple config files:",
                            "/myproject/.gherlintrc\n  /myproject/.gherlintrc.js\n  /myproject/.gherlintrc.json",
                        ],
                        ["Using config file '.gherlintrc'"],
                    ],
                ],
                [
                    ".gherlintrc.js - multiple",
                    ".gherlintrc.js",
                    {
                        ".gherlintrc.json": "{}",
                        ".gherlintrc.js": "{}",
                    },
                    [
                        [
                            "Found multiple config files:",
                            "/myproject/.gherlintrc.js\n  /myproject/.gherlintrc.json",
                        ],
                        ["Using config file '.gherlintrc.js'"],
                    ],
                ],
            ])("%s config file", (_, expectedFile, vfsJson, logs) => {
                const vfs = createVfs(vfsJson);
                fs.use(vfs);

                const config = new GherlintConfig({});

                expect(config.searchConfigFile()).toEqual(
                    `${tmpCwd}/${expectedFile}`
                );

                if (logs.length) {
                    expect(spyLog).toHaveBeenCalledTimes(logs.length);
                    expect(spyLog).toHaveNthReturnedWith(1, logs[0]);
                    expect(spyLog).toHaveNthReturnedWith(2, logs[1]);
                } else {
                    expect(spyLog).toHaveBeenCalledTimes(0);
                }

                // reset vfs
                vfs.reset();
            });
        });

        describe("readConfigFromFile", () => {
            afterEach(() => {
                jest.clearAllMocks();
            });

            it("should return empty object", () => {
                const config = new GherlintConfig({});

                expect(config.readConfigFromFile()).toEqual({});
            });
            it.each([
                [".gherlintrc", { ".gherlintrc": "{}" }, {}],
                [
                    ".gherlintrc",
                    { ".gherlintrc": '{"files":[],"rules":{}}' }, // eslint-disable-line quotes
                    { files: [], rules: {} },
                ],
                [
                    ".gherlintrc.json",
                    { ".gherlintrc.json": '{"files":[],"rules":{}}' }, // eslint-disable-line quotes
                    { files: [], rules: {} },
                ],
            ])(
                "should read from '%s' file",
                (configFile, vfsJson, expectedConfig) => {
                    const vfs = createVfs(vfsJson);
                    fs.use(vfs);

                    const config = new GherlintConfig({});

                    expect(
                        config.readConfigFromFile(`${tmpCwd}/${configFile}`)
                    ).toEqual(expectedConfig);

                    // reset vfs
                    vfs.reset();
                }
            );
            // could find any way to mock `require` function
            // TODO: find a way to mock `require` function and merge this to above test
            it.each([
                [
                    ".gherlintrc.js",
                    `${fixturesPath}/.gherlintrc.js`,
                    { files: [], rules: {} },
                ],
            ])(
                "should read from '%s' file",
                (configFile, configPath, expectedConfig) => {
                    const config = new GherlintConfig({});

                    expect(config.readConfigFromFile(configPath)).toEqual(
                        expectedConfig
                    );
                }
            );
            it.each([[".gherlintrc", { ".gherlintrc": "invalid" }, {}]])(
                "should throw for invalid config file",
                (configFile, vfsJson) => {
                    const vfs = createVfs(vfsJson);
                    fs.use(vfs);

                    const spyOnExit = jest
                        .spyOn(process, "exit")
                        .mockImplementation(() => {
                            throw new Error("process.exit");
                        });

                    const config = new GherlintConfig({});

                    expect(() =>
                        config.readConfigFromFile(`${tmpCwd}/${configFile}`)
                    ).toThrow();
                    expect(spyOnExit).toHaveBeenCalledWith(1);
                    expect(spyLog).toHaveBeenCalledTimes(1);
                    expect(spyLog).toHaveReturnedWith([
                        "Invalid config file!",
                        expect.stringMatching(
                            /.gherlintrc: Unexpected token (.*)/
                        ),
                    ]);

                    // reset vfs
                    vfs.reset();
                }
            );
        });

        describe("getFeatureFiles", () => {
            let vfs;
            beforeAll(() => {
                vfs = createVfs({
                    "features/webUI/login.feature": "",
                    "features/apiCreate/createUser.feature": "",
                    "features/signup.feature": "",
                    "features/lorem.txt": "",
                });
                fs.use(vfs);
            });

            afterAll(() => {
                vfs.reset();
            });

            it("should return '[]' if no arg is provided", () => {
                const config = new GherlintConfig({});

                expect(config.getFeatureFiles()).toEqual([]);
            });
            it.each([
                "*.feature",
                "not-existing/**/*.feature",
                "features/nonSuite/*.feature",
            ])("should return '[]' if not found", (pattern) => {
                const config = new GherlintConfig({});

                // Note: have to provide root vfs path with memfs
                const files = config.getFeatureFiles(`${tmpCwd}/${pattern}`);

                expect(files).toHaveLength(0);
                expect(config.getFeatureFiles()).toEqual([]);
            });
            it.each([
                [
                    ["features"],
                    [
                        `${tmpCwd}/features/signup.feature`,
                        `${tmpCwd}/features/apiCreate/createUser.feature`,
                        `${tmpCwd}/features/webUI/login.feature`,
                    ],
                    3,
                ],
                [
                    ["features/**/*.feature"],
                    [
                        `${tmpCwd}/features/signup.feature`,
                        `${tmpCwd}/features/apiCreate/createUser.feature`,
                        `${tmpCwd}/features/webUI/login.feature`,
                    ],
                    3,
                ],
                [
                    ["features/*.feature"],
                    [`${tmpCwd}/features/signup.feature`],
                    1,
                ],
                [
                    ["features/*/*.feature"],
                    [
                        `${tmpCwd}/features/apiCreate/createUser.feature`,
                        `${tmpCwd}/features/webUI/login.feature`,
                    ],
                    2,
                ],
            ])("should return feature files", (pattern, results, length) => {
                const config = new GherlintConfig({});

                const files = config.getFeatureFiles(`${tmpCwd}/${pattern}`);

                expect(files).toHaveLength(length);
                expect(files.sort()).toEqual(results.sort());
            });
        });

        describe("mergeWithDefaultConfig", () => {
            it.each([
                ["empty config", {}, defaultConfig],
                [
                    "files config",
                    { files: ["/path/to/features"] },
                    getUpdatedConfig("files", ["/path/to/features"]),
                ],
                [
                    "rules config",
                    { rules: { indentation: ["error"] } },
                    getUpdatedConfig("rules", { indentation: ["error"] }),
                ],
            ])("should merge config: %s", (_, userConfig, expectedConfig) => {
                const config = new GherlintConfig({});

                expect(config.mergeWithDefaultConfig(userConfig)).toStrictEqual(
                    expectedConfig
                );
            });
        });

        describe("validateConfig", () => {
            afterAll(() => {
                jest.restoreAllMocks();
                jest.clearAllMocks();
            });

            it.each([
                {},
                {
                    files: ["/path/to/features"],
                },
                {
                    rules: {},
                },
                {
                    rules: { indentation: ["info"] },
                },
            ])("should not complain if config is valid", (userConfig) => {
                jest.spyOn(
                    GherlintConfig.prototype,
                    "validateRules"
                ).mockReturnValue(null);

                const config = new GherlintConfig({});

                expect(config.validateConfig(userConfig)).toEqual(undefined);
            });
            it.each([
                [
                    {
                        file: ["/path/to/features"],
                    },
                    ["[.gherlintrc] Invalid config properties!", "file"],
                ],
                [
                    {
                        files: {},
                    },
                    [
                        "[.gherlintrc] Invalid config value. Must of type 'array'",
                        "files",
                    ],
                ],
                [
                    {
                        unknownProp: {},
                    },
                    ["[.gherlintrc] Invalid config properties!", "unknownProp"],
                ],
                [
                    {
                        rules: null,
                    },
                    [
                        "[.gherlintrc] Invalid config value. Must of type 'object'",
                        "rules",
                    ],
                ],
            ])(
                "should complain if config is invalid",
                (userConfig, errMessage) => {
                    const spyOnExit = jest
                        .spyOn(process, "exit")
                        .mockImplementation(() => {
                            throw new Error("process.exit");
                        });

                    const config = new GherlintConfig({});
                    config.configFilePath = ".gherlintrc";

                    expect(() => config.validateConfig(userConfig)).toThrow();
                    expect(spyOnExit).toHaveBeenCalledTimes(1);
                    expect(spyLog).toHaveBeenCalledTimes(1);
                    expect(spyLog).toHaveReturnedWith(errMessage);
                }
            );
            it("should call validateRules", () => {
                const spyValidateRules = jest
                    .spyOn(GherlintConfig.prototype, "validateRules")
                    .mockReturnValue(null);

                const config = new GherlintConfig({});
                config.validateConfig({ rules: {} });

                expect(spyValidateRules).toHaveBeenCalledWith({});
            });
        });

        describe("validateRules", () => {
            afterAll(() => {
                jest.restoreAllMocks();
                jest.clearAllMocks();
            });

            it.each([
                {},
                {
                    indentation: "off",
                },
                {
                    indentation: ["error"],
                },
                {
                    indentation: ["off", 2],
                },
                {
                    indentation: ["warn", 4],
                },
            ])("should not complain if rules are valid", (rules) => {
                const config = new GherlintConfig({});

                expect(config.validateRules(rules)).toEqual(undefined);
            });
            it.each([
                [
                    {
                        indentation: true,
                    },
                    [
                        "Invalid rule value (expected String or Array)",
                        "[RULE] indentation: true",
                    ],
                ],
                [
                    {
                        indentation: "info",
                    },
                    [
                        "[.gherlintrc] Invalid rule value!",
                        "[RULE] indentation: info\n  Expected one of these: off, warn, error",
                    ],
                ],
                [
                    {
                        indentation: ["extra"],
                    },
                    [
                        "[.gherlintrc] Invalid rule value!",
                        "[RULE] indentation: extra\n  Expected one of these: off, warn, error",
                    ],
                ],
            ])("should complain if rules are invalid", (rules, errMessage) => {
                const spyOnExit = jest
                    .spyOn(process, "exit")
                    .mockImplementation(() => {
                        throw new Error("process.exit");
                    });

                const config = new GherlintConfig({});
                config.configFilePath = ".gherlintrc";

                expect(() => config.validateRules(rules)).toThrow();
                expect(spyOnExit).toHaveBeenCalledTimes(1);
                expect(spyLog).toHaveBeenCalledTimes(1);
                expect(spyLog).toHaveReturnedWith(errMessage);
            });
        });

        describe("getDefaultConfig", () => {
            it("should return default config", () => {
                const config = new GherlintConfig({});

                expect(config.getDefaultConfig()).toEqual(defaultConfig);
            });
        });

        describe("getConfigFilePattern", () => {
            it("should return config file pattern", () => {
                const config = new GherlintConfig({});

                expect(config.getConfigFilePattern()).toEqual(
                    configFilePattern
                );
            });
        });

        describe("initializeConfig", () => {
            it("should generate a config file", async () => {
                const vfs = createVfs({
                    "package.json": "{}",
                });
                fs.use(vfs);

                const config = new GherlintConfig({});

                await expect(config.initializeConfig()).resolves.not.toThrow();
                expect(fs.existsSync(`${tmpCwd}/.gherlintrc`)).toEqual(true);
                expect(
                    JSON.parse(fs.readFileSync(`${tmpCwd}/.gherlintrc`, "utf8"))
                ).toEqual(defaultConfig);
                expect(spyLog).toHaveBeenCalledTimes(2);
                expect(spyLog).toHaveNthReturnedWith(1, [
                    "Initializing config file...",
                ]);
                expect(spyLog).toHaveNthReturnedWith(2, [
                    "Config file initialized!",
                ]);

                // reset vfs
                vfs.reset();
            });
        });
    });
});

// creates virtual file system from json
function createVfs(vfsJson) {
    return Volume.fromJSON(vfsJson, tmpCwd);
}

function getUpdatedConfig(key, value) {
    const config = cloneDeep(defaultConfig);

    if (value instanceof Object && !(value instanceof Array)) {
        config[key] = { ...config[key], ...value };
    } else {
        config[key] = value;
    }

    return config;
}
