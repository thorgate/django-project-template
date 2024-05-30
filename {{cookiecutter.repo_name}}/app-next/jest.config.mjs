import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
    // Add more setup options before each test is run
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    modulePathIgnorePatterns: ["<rootDir>/cypress/"],

    testEnvironment: "jest-environment-jsdom",

    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    coverageReporters: [
        "json",
        "lcov",
        "text",
        "text-summary",
        "cobertura",
        "clover",
    ],

    coveragePathIgnorePatterns: [
        "<rootDir>/mock",
        "<rootDir>/lib/queries/queriesApi.generated.ts",
    ],

    testPathIgnorePatterns: [
        "<rootDir>/.next/",
        "<rootDir>/cypress/",
        "<rootDir>/node_modules/",
        "<rootDir>/coverage",
        "<rootDir>/dist",
    ],
};

const asyncConfig = createJestConfig(config);

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default async () => {
    const baseConfig = await asyncConfig();

    return {
        ...baseConfig,
        transformIgnorePatterns: [
            "node_modules/((?!jose).)/$",
            "^.+\\.module\\.(css|sass|scss)$",
        ],
    };
};
