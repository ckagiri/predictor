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
    ]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime'
  ],
};
