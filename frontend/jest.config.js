export default {
  globalSetup: './test-global-setup.ts',
  setupFilesAfterEnv: ['./test-setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.[tj]sx?$':
    '^.+.tsx?$': [
      'ts-jest',
      {
        // isolatedModules: true,
        // useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.svg$': 'jest-transformer-svg',
  },
};
