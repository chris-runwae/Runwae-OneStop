module.exports = {
  printWidth: 80,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: "es5",

  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  tailwindAttributes: ["className"],
};
