import * as React from "react";
import { useTranslation } from "next-i18next";
import { BaseComboboxOption } from "./ComboboxBody";

export const ComboboxValues: React.FC<
    React.LabelHTMLAttributes<HTMLLabelElement> & {
        value?: BaseComboboxOption | BaseComboboxOption[] | null;
        limit?: number;
    }
> = ({ value, limit: providedLimit, ...props }) => {
    const { t } = useTranslation("common");
    const values = React.useMemo<BaseComboboxOption[]>(() => {
        if (Array.isArray(value)) {
            return value;
        }
        return value ? [value] : [];
    }, [value]);
    const [limit, setLimit] = React.useState(() => providedLimit ?? 10);
    const limitRef = React.useRef<HTMLLabelElement>(null);

    React.useEffect(() => {
        if (providedLimit) {
            return;
        }
        if (!limitRef.current) {
            return;
        }
        /* Attempt automatic limit reduction if values don't fit into the input */
        if (limitRef.current.offsetWidth < limitRef.current.scrollWidth) {
            setLimit((prev) => Math.max(prev - 1, 1));
        }
    }, [providedLimit, value]);

    const { truncatedValues, more } = React.useMemo(
        () => ({
            truncatedValues: values.slice(
                0,
                values.length > limit ? limit - 1 : undefined,
            ),
            more: Math.max(0, values.length - limit + 1),
        }),
        [values, limit],
    );
    return (
        <label {...props} ref={limitRef}>
            {truncatedValues.map((item, index) => (
                <React.Fragment key={item.key}>
                    {item.label}
                    {index + 1 < truncatedValues.length ? ", " : ""}
                </React.Fragment>
            ))}
            {more > 1
                ? more === values.length
                    ? t("combobox.nSelected", {
                          count: more,
                      })
                    : t("combobox.showMore", {
                          count: more,
                      })
                : null}
        </label>
    );
};
