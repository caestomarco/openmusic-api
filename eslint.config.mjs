import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
    { files: ["**/*.js"], languageOptions: { sourceType: "module" } },
    { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
    {
        rules: {
            "no-console": 0,
            "eol-last": "off",
            "no-alert": "off",
            "no-unused-vars": "error",
            "no-multiple-empty-lines": "error",
            "global-require": "off",
            "padded-blocks": "off",
            "object-curly-newline": "off",
            "no-underscore-dangle": "off",
            "linebreak-style": "off",
            "camelcase": "off",
            "semi": [ "error", "always" ],
            "import/no-extraneous-dependencies": "off",
            "object-curly-spacing": [ "error", "always" ],
            "indent": [ "error", 4, { "SwitchCase": 1 } ],
            "brace-style": [ "error", "allman", { "allowSingleLine": true } ],
            "max-len": [ "error", 200 ]
        }
    }
]);
