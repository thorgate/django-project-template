import React from "react";
import { useTranslation } from "next-i18next";
import { Listbox } from "@headlessui/react";
import { useRouter } from "next/router";
import {
    BaseQueryArgType,
    ReplaceQueryParametersFunction,
    SelectURLParameterSpecification,
} from "@lib/factories/types";
import { StyledListBox } from "@components/Input/StyledListBox";

export interface SelectFilterProps<
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SelectURLParameterSpecification<QueryArgType, QueryArg>
> {
    parameter: UrlParameter;
    initial: QueryArgType[QueryArg] | undefined;
    replaceQueryParameter: ReplaceQueryParametersFunction<QueryArgType>;
}

export const SelectFilter = <
    QueryArgType extends BaseQueryArgType,
    QueryArg extends keyof QueryArgType,
    UrlParameter extends SelectURLParameterSpecification<QueryArgType, QueryArg>
>({
    parameter,
    initial,
    replaceQueryParameter,
}: SelectFilterProps<QueryArgType, QueryArg, UrlParameter>) => {
    const { t } = useTranslation("common");
    const router = useRouter();
    const [selected, setSelected] = React.useState<
        UrlParameter["options"][number]
    >(
        parameter.options.filter((p) => p.value === initial)[0] ||
            parameter.options[0]
    );

    const onChange = React.useMemo<
        Required<React.ComponentProps<typeof Listbox>>["onChange"]
    >(
        () => (option: typeof selected) => {
            setSelected(option);
            replaceQueryParameter({
                parameter,
                value: option.value,
                router,
            });
        },
        [parameter, replaceQueryParameter, router]
    );

    const onReset = React.useMemo<
        Required<React.InputHTMLAttributes<HTMLButtonElement>>["onClick"]
    >(
        () => () => {
            onChange(
                parameter.options.filter(
                    (p) => p.value === parameter.defaultValue
                )[0] || parameter.options[0]
            );
        },
        [parameter, onChange]
    );

    return (
        <StyledListBox
            selectedOption={selected}
            onChange={onChange}
            onReset={onReset}
            options={parameter.options}
            label={parameter.label ?? t("filters.select")}
        />
    );
};
