module.exports = {
  "extends": ["eslint:recommended"],
  "env": {
    es6: true,
    node: true
  },
  "settings": {
    "polyfills": [
    ]
  },
  "overrides": [
    {
    "files": ["**/*.md"],
    "rules": {
      "eol-last": ["off"],
      "no-console": ["off"],
      "no-undef": ["off"],
      "no-unused-vars": ["off"],
      "padded-blocks": ["off"],
      "import/unambiguous": ["off"],
      "import/no-commonjs": ["off"],
      "import/no-unresolved": ["off"],
      "node/no-missing-require": ["off"],
      "node/no-missing-import": ["off"]
    }
    }
  ],
  "rules": {
  }
};
