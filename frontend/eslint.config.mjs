import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript version
      sourceType: "module",  // Enable ES6 modules
    },
    rules: {
      "no-undef": "off", // Example: Disable 'no-undef' rule
      "no-unused-vars": "off", // Example: Warn on unused variables
      "no-console": "off", // Example: Allow console statements
    },
  },
];