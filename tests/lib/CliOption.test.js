const CliOption = require("../../lib/CliOption");

describe("CliOptions", () => {
    describe("path to file", () => {
        it("should have files property", () => {
            const options = CliOption.parse([
                "node",
                "command",
                "test.feature",
            ]);
            expect(options.cliConfig).toHaveProperty("files", ["test.feature"]);
        });
    });

    describe("without args", () => {
        it("should have files property", () => {
            const options = CliOption.parse(["node", "command"]);
            expect(options.cliConfig).not.toHaveProperty("files");
        });
    });
});
