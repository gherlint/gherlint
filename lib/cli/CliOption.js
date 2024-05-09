const { program } = require("commander");
const { packageInfo } = require("../../utils");

module.exports = class CliOption {
    // CLI options
    static program = program
        .usage("[options] <[FEATURE FILE | DIR | GLOB]>")
        .version(
            `${packageInfo.getModuleName()}: ${packageInfo.getModuleVersion()}`,
            "-v, --version",
            "Output the version number"
        )
        .option("--fix", "Apply possible fixes to the problems")
        .option("-c, --config <path:String>", "Use this configuration")
        .showHelpAfterError();

    static parse(args) {
        this.program.parse(args);
        const options = this.program.opts();
        options.files = this.program.args;
        return options;
    }
};
