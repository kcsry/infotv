module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
    ],
    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react/prop-types": "off",
    },
};
