const path = require("path");

const tmpCwd = "/myproject";
const fixturesPath = path.resolve(
    path.join(__dirname, "../", "../", "__fixtures__", "gherlintConfigs")
);

// mock modules
jest.mock("fs", () => {
    const fs = jest.requireActual("fs");
    const { ufs } = require("unionfs");
    return ufs.use(fs);
});
jest.mock("../../../utils/Path", () => ({
    cwd: jest.fn().mockReturnValue(tmpCwd),
}));

const fs = require("fs");
const { Volume } = require("memfs");
const GherlintConfig = require("../../../lib/gherlint/GherlintConfig");

describe("class: GherlintConfig", () => {
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
            let spySearchConfigFile;
            beforeAll(() => {
                spySearchConfigFile = jest
                    .spyOn(GherlintConfig.prototype, "searchConfigFile")
                    .mockReturnValue(null);
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
        });

        describe("searchConfigFile", () => {
            it("no config file", () => {
                const config = new GherlintConfig({});

                expect(config.searchConfigFile()).toEqual(null);
            });
            it.each([
                [".gherlintrc", { ".gherlintrc": "{}" }],
                [".gherlintrc.json", { ".gherlintrc.json": "{}" }],
                [".gherlintrc.js", { ".gherlintrc.js": "{}" }],
                [
                    ".gherlintrc",
                    {
                        ".gherlintrc.json": "{}",
                        ".gherlintrc": "{}",
                        ".gherlintrc.js": "{}",
                    },
                ],
            ])("%s config file", (expectedFile, vfsJson) => {
                const vfs = createVfs(vfsJson);
                fs.use(vfs);

                const config = new GherlintConfig({});

                expect(config.searchConfigFile()).toEqual(
                    `${tmpCwd}/${expectedFile}`
                );

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

                    // reset vfs
                    vfs.reset();
                }
            );
        });
    });
});

// creates virtual file system from json
function createVfs(vfsJson) {
    return Volume.fromJSON(vfsJson, tmpCwd);
}
