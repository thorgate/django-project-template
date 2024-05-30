import type { ConfigFile } from "@rtk-query/codegen-openapi";

// See https://redux-toolkit.js.org/rtk-query/usage/code-generation
// Re-generate API slice with `make generate-rtk-query-api`

const config: ConfigFile = {
    schemaFile: "./schema.json",
    apiFile: "./baseQueriesApi.ts",
    apiImport: "baseQueriesApi",
    outputFile: "./queriesApi.generated.ts",
    exportName: "queriesApi",
    hooks: true,
    tag: true,
    mergeReadWriteOnly: true,
};

// eslint-disable-next-line import/no-default-export
export default config;
