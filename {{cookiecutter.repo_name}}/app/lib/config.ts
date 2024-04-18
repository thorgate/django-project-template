declare global {
    interface Window {
        __ENV: Record<string, string>;
    }
}

const prefix = "APP_PUBLIC";

function isBrowser() {
    return Boolean(typeof window !== "undefined" && window.__ENV);
}

function getFiltered() {
    return Object.keys(process.env)
        .filter((key) => new RegExp(`^${prefix}_`, "i").test(key))
        .reduce((env, key) => {
            env[key] = process.env[key];
            return env;
        }, {} as Record<string, string | undefined>);
}

export function parseValue(
    value: string | undefined,
    type: "string"
): string | undefined;
export function parseValue(
    value: string | undefined,
    type: "number"
): number | undefined;
export function parseValue(
    value: string | undefined,
    type: "boolean"
): boolean | undefined;

export function parseValue(
    value: string | undefined,
    type: "string" | "number" | "boolean" = "string"
) {
    if (type === "number") {
        return Number(value);
    }

    if (type === "boolean" && value) {
        return Boolean(value === "true");
    }

    return value;
}

export default function config(key: string): string | undefined;
export default function config(key: string, type: "number"): number | undefined;
export default function config(
    key: string,
    type: "boolean"
): boolean | undefined;
export default function config(): Record<string, string | undefined>;
export default function config(
    key = "",
    type?: "string" | "number" | "boolean"
) {
    const safeKey = `${prefix}_${key}`;

    if (key.length) {
        let source: NodeJS.ProcessEnv | Record<string, string | undefined>;

        if (isBrowser()) {
            source = window.__ENV;
        } else {
            source = process.env;
        }

        const value = source[key] ?? source[safeKey];

        if (type === "number") {
            return Number(value);
        }

        if (type === "boolean" && value) {
            return Boolean(value === "true");
        }

        return value;
    }

    return isBrowser() ? window.__ENV : getFiltered();
}
