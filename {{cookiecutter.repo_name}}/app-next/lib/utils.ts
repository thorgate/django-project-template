import config from "@lib/config";

export const resolveBaseUrl = (): string => {
    return config("APP_BACKEND_SITE_URL") || config("BACKEND_SITE_URL") || "";
};

export const serializeDate = (date: Date): string => {
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(
        date,
    );
    const month = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(
        date,
    );
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
    return `${year}-${month}-${day}`;
};

export const makeNumber = (value: unknown): number =>
    typeof value === "number"
        ? value
        : Number(
              String(value ?? "0")
                  .replace(",", ".")
                  .replace(/\s+/g, ""),
          );

export const isFiniteNumber = (value: unknown): boolean =>
    value !== undefined && value !== null && Number.isFinite(makeNumber(value));
