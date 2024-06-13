import React from "react";

import {
    queriesApi,
    UserDetail,
    UserListApiArg,
    UserRetrieveApiArg,
} from "@lib/queries";
import { ApiSelectOption } from "@lib/factories/types";
import { apiSelectWithLoadInitialValueFactory } from "@lib/factories/ApiSelectHookFormFactory";
import { useLoadingFallbackValueLabel } from "@lib/factories/hooks";
import { WidgetProps } from "@lib/hooks/state";

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

export const SelectUserWidget: React.FC<WidgetProps<string>> = ({
    value,
    onChange: outerOnChange,
    onReset,
    widget: { label },
}) => {
    const onChange = React.useCallback(
        (value: string | null) => {
            outerOnChange(value ?? "");
        },
        [outerOnChange]
    );

    const selectProps = React.useMemo(
        () => ({
            className: "mt-1",
            label,
            onReset,
        }),
        [onReset, label]
    );
    const fallbackValueLabel = useLoadingFallbackValueLabel();

    return (
        <SelectUser
            value={value ?? null}
            onChange={onChange}
            fallbackValueLabel={fallbackValueLabel}
            selectProps={selectProps}
        />
    );
};
