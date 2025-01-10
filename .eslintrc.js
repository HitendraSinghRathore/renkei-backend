module.exports = {
  extends: [
    'standard',
    'plugin:import/recommended',
    'plugin:node/recommended',
    'plugin:promise/recommended'
  ],
  plugins: ['import', 'node', 'promise'],
  rules: {
    semi: ['error', 'always']
  }
};
