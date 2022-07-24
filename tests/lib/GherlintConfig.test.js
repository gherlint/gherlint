const GherlintConfig = require("../../lib/GherlintConfig");
const { gherlintrc } = require("../../lib/defaults");

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
});
