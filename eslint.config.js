/* Lint the source parts, not the built file.
 *
 * Lints the concatenated script (dist/app.js, written by tools/build.py), not
 * the individual parts: the parts share one scope at runtime, so linting them
 * separately reports every cross-file reference as undefined.
 *
 * The rules are deliberately narrow. This is 12,000 lines of browser code
 * written to be read in one file; a style linter would produce thousands of
 * opinions and no bugs found. These rules catch mistakes instead: a name that
 * does not exist, a duplicate declaration, a const that gets assigned.
 */
const globals = require('globals');

module.exports = [
  {
    files: ['dist/app.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'script',
      // `module` appears once, behind a typeof guard, in the embedded QR encoder.
      globals: { ...globals.browser, ...globals.es2021, module: 'readonly' }
    },
    rules: {
      'no-undef': 'error',
      'no-redeclare': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-unreachable': 'error',
      'no-const-assign': 'error',
      'no-fallthrough': 'error',
      'no-self-assign': 'error',
      'no-unsafe-negation': 'error',
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', vars: 'local' }]
    }
  }
];
