const path = require('path');
const {
  foremanLocation,
  foremanRelativePath,
} = require('./test-utils/findForeman.js');
const foremanFull = foremanLocation();
const foremanLintingRelative =
  './node_modules/@theforeman/vendor-dev/eslint.extends.js';
const foremanLintingConfig = foremanRelativePath(foremanLintingRelative);
const foremanVendorRelative = './node_modules/@theforeman/vendor-core/';
const foremanVendorDir = foremanRelativePath(foremanVendorRelative);

module.exports = {
  env: {
    browser: true,
    'jest/globals': true,
  },
  extends: ['airbnb', 'plugin:jest/recommended', `${foremanLintingConfig}`],
  plugins: ['jest', 'react', 'babel', 'promise'],
  parser: 'babel-eslint',
  rules: {
    'babel/semi': 1,
    'react/jsx-filename-extension': 'off',
    // Import rules off for now due to HoundCI issue
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        // Need to check foreman-tasks, Foreman, and Foreman's meta package for dependencies
        packageDir: [
          path.join(__dirname, '../foreman-tasks'),
          foremanFull,
          foremanVendorDir,
        ],
      },
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link', 'LinkContainer'],
        specialLink: ['to'],
      },
    ],
    'promise/prefer-await-to-then': 'error',
    'promise/prefer-await-to-callbacks': 'error',
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
  },
};
