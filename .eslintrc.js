module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parser: "vue-eslint-parser", // esencial para Vue 3
  parserOptions: {
    parser: "@babel/eslint-parser", // para JS moderno
    ecmaVersion: 2021,
    sourceType: "module",
    requireConfigFile: false // evita error con babel
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended"
  ],
  plugins: ["vue"],
  rules: {
    // Puedes ajustar estas reglas según tus preferencias
    "vue/multi-word-component-names": "off", // desactiva la advertencia de nombres de componentes de una palabra
    "no-console": "off",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // ignora args que empiezan con _
  },
  overrides: [
    {
      files: ["*.vue"],
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: "@babel/eslint-parser",
        ecmaVersion: 2021,
        sourceType: "module",
        requireConfigFile: false
      }
    }
  ]
};
