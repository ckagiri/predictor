module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      }
    ],
    [
      '@babel/preset-typescript',
      {
        allowNamespaces: true,
      }
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime'
  ],
  env: {
    production: {
      only: ['frontend'],
      plugins: [
        'lodash',
        'transform-react-remove-prop-types',
        '@babel/plugin-transform-react-inline-elements',
        '@babel/plugin-transform-react-constant-elements',
      ],
    },
  },
};
