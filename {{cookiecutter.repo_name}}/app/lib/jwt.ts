import * as jose from "jose";
import config from "@lib/config";

export const verifyToken = async (
    token?: string | null
): Promise<jose.JWTPayload | false> => {
    try {
        const key = config("JWT_PUBLIC_KEY");

        if (!key || !token) {
            return false;
        }

        const publicKey = await jose.importSPKI(key, "RS256");
        const { payload } = await jose.jwtVerify(token, publicKey, {
            algorithms: ["RS256"],
        });

        return payload;
    } catch (e) {
        return false;
    }
};

export function getExpirationDate(
    payload: jose.JWTPayload | false
): number | undefined | false {
    if (!payload) {
        return false;
    }

    return payload.exp;
}
