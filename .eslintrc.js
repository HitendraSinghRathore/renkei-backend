module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
  ],
  plugins: [ 'node'],
  rules: {
    semi: ['error', 'always'],
    'no-process-exit': 'off',
    'no-unused-vars': 'warn' ,
    'prefer-const': ['error', {
      destructuring: 'all',
    }],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'no-debugger': 'error',
  }
};
