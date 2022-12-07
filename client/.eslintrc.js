module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint/eslint-plugin"
  ],
  extends: [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended"
  ],
  root: true,
}
