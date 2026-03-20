import * as React from "react";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@lib/hooks/redux";

export const useSessionIsValid = () => {
    const { status, data: sessionData } = useSession();
    const sessionExpired = useAppSelector(
        (state) => state.appUser.sessionExpired
    );

    return React.useMemo<boolean | undefined>(() => {
        if (status === "loading") return undefined;
        if (status !== "authenticated") return false;
        return (
            !(sessionExpired || (sessionData?.user?.sessionExpired ?? true)) &&
            !!sessionData?.user?.accessToken
        );
    }, [sessionExpired, sessionData, status]);
};
