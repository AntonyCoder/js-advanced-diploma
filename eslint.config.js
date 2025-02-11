import js from "@eslint/js"
import importPlugin from "eslint-plugin-import"

export default [
    js.configs.recommended,
    {
        ignores: ["node_modules/", "dist/"],
    },
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                window: "readonly", 
                document: "readonly",
                navigator: "readonly",
                module: "readonly",
                require: "readonly",
                __dirname: "readonly",
            },
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "import/no-unresolved": "error",
            "no-undef": "off",
        },
    },
];
