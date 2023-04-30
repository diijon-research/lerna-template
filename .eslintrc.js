module.exports = {
    root: true,
    // This tells ESLint to load the config from the package `eslint-config-template`
    extends: ["template"],
    settings: {
      next: {
        rootDir: ["apps/*/"],
      },
    },
  };