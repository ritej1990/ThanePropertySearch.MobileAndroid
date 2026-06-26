/** Jest config for the Thane Property Search mobile app (Expo / RN). */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/services/**/*.ts',
    'src/api/**/*.ts',
  ],
};
