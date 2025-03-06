import js from "@eslint/js";
import jest from "eslint-plugin-jest";

export default [
    js.configs.recommended,
    {
        ignores: ["node_modules/*"], 
    },
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                console: "readonly",
                require: "readonly",
                module: "readonly",
                __dirname: "readonly",
                process: "readonly",
                global: "readonly",
                structuredClone: "off",

                // Jest globals
                afterAll: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                describe: "readonly",
                expect: "readonly",
                it: "readonly",
                jest: "readonly",
                test: "readonly",
            },
        },
        plugins: {
            jest, js
        },
        rules: {
            indent: ["error", 4, { SwitchCase: 1 }],
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "constructor-super": "error",
        },
    },
];
