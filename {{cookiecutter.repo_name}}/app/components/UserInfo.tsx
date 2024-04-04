import * as React from "react";

import { Button } from "@components//Button";
import { useUserMeRetrieveQuery } from "@lib/queries";
import { useTranslation } from "next-i18next";

export const UserInfo = () => {
    const { t } = useTranslation(["userDetails", "common"]);
    const [count, setCount] = React.useState(0);

    const { data, status, requestId, error } = useUserMeRetrieveQuery(
        // Re-fetch the query every time the counter changes - this is useful currently for debugging token expiry
        (count ? count : undefined) as any as void
    );

    return (
        <div className="dark:tw-text-white">
            <pre>
                {t("userDetails:user")}: {JSON.stringify(data, null, 2)}
            </pre>
            <pre>
                {t("userDetails:email")}: {data?.email}
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
