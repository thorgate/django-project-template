import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { CustomFilterWidgetPropsFromEndpoint } from "@components/ListFilter/types";

import {
    queriesApi,
    UserDetail,
    UserListApiArg,
    UserRetrieveApiArg,
} from "@lib/queries";
import { ApiSelectOption } from "@lib/factories/types";
import { apiSelectWithLoadInitialValueFactory } from "@lib/factories/ApiSelectHookFormFactory";
import { useLoadingFallbackValueLabel } from "@lib/factories/hooks";

const getOptionForItem = (item: UserDetail): ApiSelectOption<string> => ({
    value: item.email,
    key: item.email,
    label: `${item.name} (${item.email})`,
    displayValue: item.name,
});

const SelectUser = apiSelectWithLoadInitialValueFactory<
    UserDetail,
    UserListApiArg,
    string,
    UserRetrieveApiArg
>({
    retrieveEndpoint: queriesApi.endpoints.userList,
    getSearchQueryArgs: (query) => ({ search: query }),
    getOptionForItem,
    extraComboboxBodyProps: {
        allowWrap: false,
        displaySelectedSeparately: false,
    },
    initialValueRetrieveEndpoint: queriesApi.endpoints.userRetrieve,
    getInitialValueQueryArgs: (value) => ({ email: value || "" }),
});

export const SelectUserWidget = ({
    parameter,
    initial,
    replaceQueryParameter,
}: CustomFilterWidgetPropsFromEndpoint<
    typeof queriesApi.endpoints.userList,
    "email"
>) => {
    const router = useRouter();
    const { t } = useTranslation(["common"]);

    const onChange = React.useCallback(
        (value: string | null) => {
            replaceQueryParameter({
                parameter,
                value: value ?? undefined,
                router,
            });
        },
        [parameter, router, replaceQueryParameter]
    );

    const selectProps = React.useMemo(
        () => ({
            className: "mt-1",
            label: parameter.label ?? t("filters.select"),
        }),
        [t, parameter]
    );
    const fallbackValueLabel = useLoadingFallbackValueLabel();

    return (
        <SelectUser
            value={initial ?? null}
            onChange={onChange}
            fallbackValueLabel={fallbackValueLabel}
            selectProps={selectProps}
        />
    );
};
