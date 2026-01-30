module.exports = {
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  proseWrap: "never",
  endOfLine: "lf",
  semi: true,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  singleAttributePerLine: true,
  overrides: [
    {
      files: [
        ".prettierrc",
        ".prettierrc.json",
        ".prettierrc.yml",
        ".prettierrc.yaml",
        ".prettierrc.json5",
        ".prettierrc.js",
        ".prettierrc.cjs",
        ".prettierrc.mjs",
        ".prettierrc.ts",
      ],
      options: {
        parser: "json",
      },
    },
    {
      files: ["*.html", "*.ejs"],
      options: {
        parser: "html",
      },
    },
    {
      files: ["*.mdx", "*.md"],
      options: {
        parser: "mdx",
      },
    },
  ],
};
