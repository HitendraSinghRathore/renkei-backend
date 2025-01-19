module.exports = {
  extends: [
    'plugin:node/recommended',
  ],
  plugins: [ 'node'],
  rules: {
    semi: ['error', 'always'],
    'no-process-exit': 'off',
    'no-unused-vars': 'warn' ,
  }
};
