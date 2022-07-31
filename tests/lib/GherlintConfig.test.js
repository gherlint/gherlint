const { vol } = require("memfs");
const { merge } = require("lodash");
// Todo: need a working solition
// "patchRequire" doesn't work with Jest
// const { patchRequire } = require("fs-monkey");

const GherlintConfig = require("../../lib/GherlintConfig");
const { gherlintrc } = require("../../lib/defaults");

// explicit mocking is required to mock node core modules
jest.mock("fs");

describe("GherlintConfig", () => {
    describe("default config", () => {
        const defaultConfig = { ...gherlintrc, cliOptions: {} };
        it("should have default config", () => {
            const { configuration } = new GherlintConfig();

            expect(configuration).toMatchObject(defaultConfig);
        });
    });

    describe("with cli options", () => {
        const cliOptions = {
            cliConfig: {
                files: ["path/to/file.feature"],
            },
            fix: true,
        };
        const expectedConfig = {
            ...gherlintrc,
            cliOptions: {
                fix: cliOptions.fix,
            },
            files: cliOptions.cliConfig.files,
        };

        it("should have config with cli options", () => {
            const { configuration } = new GherlintConfig(cliOptions);

            expect(configuration).toMatchObject(expectedConfig);
        });
    });

    describe("methods", () => {
        describe("readConfigFromFile", () => {
            const configFiles = {
                "./gherlintrc": JSON.stringify(gherlintrc),
                "./gherlintrc.json": JSON.stringify(gherlintrc),
                "./gherlintrc.js": `module.exports = ${gherlintrc};`,
            };
            let gConfig, spyValidateConfig, spyMergeWithDefaultConfig;

            beforeAll(() => {
                // create virtual file system
                vol.fromJSON(configFiles);
                // Todo: need a working solition
                //"patchRequire" doesn't work with Jest
                // patchRequire(vol);

                gConfig = new GherlintConfig();

                // mock external functions
                spyValidateConfig = jest
                    .spyOn(gConfig, "validateConfig")
                    .mockImplementation();
                spyMergeWithDefaultConfig = jest
                    .spyOn(gConfig, "mergeWithDefaultConfig")
                    .mockImplementation((config) => merge(gherlintrc, config));
            });

            afterAll(() => {
                vol.reset();
            });

            it.each(Object.keys(configFiles))(
                "should read file: %s",
                (configFile) => {
                    // Todo: need a working solition
                    // "patchRequire" doesn't work with Jest
                    // remove the line and the failing test below when the solution is found
                    if (configFile.endsWith(".js")) return;

                    const config = gConfig.readConfigFromFile(configFile);

                    expect(spyValidateConfig).toHaveBeenCalledTimes(1);
                    expect(spyMergeWithDefaultConfig).toHaveBeenCalledTimes(1);
                    expect(config).toMatchObject(gherlintrc);
                }
            );

            it.failing("should read file: ./gherlintrc.js", () => {
                expect(
                    gConfig.readConfigFromFile("./gherlintrc.js")
                ).not.toThrow();
            });
        });
    });
});
