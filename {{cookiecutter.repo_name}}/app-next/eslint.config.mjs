import { globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import eslintReact from "@eslint-react/eslint-plugin";
import importX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";

export default tseslint.config(
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "public/**",
        "coverage/**",
        "*.config.js",
        "*.config.mjs",
        "scripts/**",
        "types/**/*.d.ts",
    ]),
    ...tseslint.configs.recommended,
    eslintReact.configs["recommended-typescript"],
    prettier,
    {
        plugins: {
            "@next/next": nextPlugin,
            "import-x": importX,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-non-null-assertion": "off",
            "no-console": "error",
            "import-x/no-default-export": "error",
            "import-x/order": "error",
            "@eslint-react/jsx-no-useless-fragment": "error",
        },
    },
    {
        files: [
            "pages/**/*",
            "**/*.stories.@(js|jsx|mjs|ts|tsx)",
            "lib/config.ts",
            "proxy.ts",
        ],
        rules: {
            "import-x/no-default-export": "off",
        },
    },
    {
        files: [
            "lib/queries/queriesApi.generated.ts",
            "lib/queries/queriesApi.generated.base.ts",
        ],
        rules: {
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-unsafe-function-type": "off",
        },
    },
);
