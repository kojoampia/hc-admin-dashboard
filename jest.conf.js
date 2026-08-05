const { pathsToModuleNameMapper } = require('ts-jest');
const { createCjsPreset } = require('jest-preset-angular/presets');

const {
  compilerOptions: { paths = {}, baseUrl = './' },
} = require('./tsconfig.json');
const environment = require('./webpack/environment');

module.exports = {
  ...createCjsPreset(),
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|dayjs/esm|@angular/common/locales/.*\\.js$|d3-.*|internmap))'],
  globals: {
    ...environment,
    // app.constants.ts reads REALTIME_ENABLED, which only webpack.custom.js's DefinePlugin ever
    // defines — environment.js carries the per-profile DEV_/TEST_/PROD_ variants instead. Without
    // it every spec that pulls in app.constants dies with "REALTIME_ENABLED is not defined".
    // false, matching the dev profile: specs should not try to open a socket.
    REALTIME_ENABLED: environment.DEV_REALTIME_ENABLED,
  },
  roots: ['<rootDir>', `<rootDir>/${baseUrl}`],
  modulePaths: [`<rootDir>/${baseUrl}`],
  setupFiles: ['jest-date-mock'],
  // Initialises TestBed and pulls in @angular/compiler. Without it every spec that touches an
  // Angular injectable dies with "needs to be compiled using the JIT compiler" — the app is
  // zone-based (`polyfills: ["zone.js"]` in angular.json), hence the zone entrypoint.
  setupFilesAfterEnv: ['jest-preset-angular/setup-env/zone'],
  cacheDirectory: '<rootDir>/target/jest-cache',
  coverageDirectory: '<rootDir>/target/test-results/',
  // Set at the level the suite actually meets today (91.89 / 64.74 / 85.78 / 92.2), rounded down a
  // little for headroom — a floor, not a target. Coverage was reported and never enforced, which
  // means it could only drift downwards without anyone noticing.
  //
  // Branch coverage is much lower than the rest because the generated entity components carry a lot
  // of untaken error paths. Raise these as they improve; do not lower them to make a change fit.
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 62,
      functions: 84,
      lines: 90,
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: `<rootDir>/${baseUrl}/` }),
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '<rootDir>/target/test-results/', outputName: 'TESTS-results-jest.xml' }],
    ['jest-sonar', { outputDirectory: './target/test-results/jest', outputName: 'TESTS-results-sonar.xml' }],
  ],
  testMatch: ['<rootDir>/src/main/webapp/app/**/@(*.)@(spec.ts)'],
  testEnvironmentOptions: {
    url: 'https://jhipster.tech',
  },
};
