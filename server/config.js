module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/unit/**/*.test.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    '!controllers/index.js'
  ]
};