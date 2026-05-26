import config from "@lib/config";

export const resolveBaseUrl = (): string => {
    return config("APP_BACKEND_SITE_URL") || config("BACKEND_SITE_URL") || "";
};
