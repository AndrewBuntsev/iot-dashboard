import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: ['/tests/integration/'],
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
};