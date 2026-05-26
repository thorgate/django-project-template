import * as React from "react";

import { useTranslation } from "next-i18next";
import { Button } from "@components//Button";
import { useUserMeRetrieveQuery } from "@lib/queries";

export const UserInfo = () => {
    const { t } = useTranslation(["user", "common"]);
    const [count, setCount] = React.useState(0);

    const { data, status, requestId, error } = useUserMeRetrieveQuery(
        // Re-fetch the query every time the counter changes - this is useful currently for debugging token expiry
        (count ? count : undefined) as unknown as void
    );

    return (
        <div className="dark:text-white">
            <pre>
                {t("user:user")}: {JSON.stringify(data, null, 2)}
            </pre>
            <pre>
                {t("user:email")}: {data?.email}
            </pre>
            <pre>
                {t("common:status")}: {status}
            </pre>
            <pre>
                {t("common:requestId")}: {requestId}
            </pre>
            <pre>
                {t("common:error")}: {JSON.stringify(error, null, 2)}
            </pre>
            <pre>
                {t("common:count")}: {count}{" "}
                <Button onClick={() => setCount(count + 1)}>+</Button>
            </pre>
        </div>
    );
};
