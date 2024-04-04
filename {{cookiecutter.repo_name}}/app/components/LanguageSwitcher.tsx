import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";

import i18nSettings from "@/i18n.json";

function capitalize(lang: string) {
    return lang.slice(0, 1).toUpperCase() + lang.slice(1);
}

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const { language: currentLanguage } = i18n;
    const router = useRouter();
    const locales = router.locales ?? [currentLanguage];

    const languageNames = useMemo(() => {
        return new Intl.DisplayNames([currentLanguage ?? i18nSettings.DEFAULT_LANGUAGE], {
            type: "language",
        });
    }, [currentLanguage]);

    const [value, setValue] = useState(i18n.language ?? i18nSettings.DEFAULT_LANGUAGE);

    const switchToLocale = useCallback(
        async (locale: string) => {
            const path = router.asPath;

            await router.push(path, path, { locale });
            router.reload();
        },
        [router]
    );

    const languageChanged = useCallback(
        async (option: string) => {
            setValue(option);

            await switchToLocale(option);
        },
        [switchToLocale]
    );

    return (
        <Listbox value={value} onChange={languageChanged}>
            {({ open }) => (
                <div className="tw-relative tw-mr-2 tw-w-28">
                    <Listbox.Button className="tw-relative tw-w-full tw-cursor-default tw-rounded-md tw-bg-white tw-py-1.5 tw-pl-3 tw-pr-10 tw-text-left tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-outline-none tw-focus:ring-2 focus:tw-ring-indigo-500 sm:tw-text-sm sm:tw-leading-6">
                        {capitalize(languageNames.of(value) ?? value)}
                    </Listbox.Button>

                    <Transition
                        show={open}
                        as={Fragment}
                        leave="tw-transition tw-ease-in tw-duration-100"
                        leaveFrom="tw-opacity-100"
                        leaveTo="tw-opacity-0"
                    >
                        <Listbox.Options className="tw-absolute tw-z-10 tw-mt-1 tw-max-h-56 tw-w-full tw-overflow-auto tw-rounded-md tw-bg-white tw-py-1 tw-text-base tw-shadow-lg tw-ring-1 tw-ring-black tw-ring-opacity-5 focus:tw-outline-none sm:tw-text-sm">
                            {locales.map((locale) => {
                                const label = capitalize(
                                    languageNames.of(locale) ?? locale
                                );

                                return (
                                    <Listbox.Option
                                        key={locale}
                                        value={locale}
                                        className={({ active }) =>
                                            clsx(
                                                active
                                                    ? "tw-bg-indigo-600 tw-text-white"
                                                    : "tw-text-gray-900",
                                                "tw-relative tw-cursor-default tw-select-none tw-py-2 tw-pl-3 tw-pr-9"
                                            )
                                        }
                                    >
                                        {({ selected, active }) => (
                                            <div className="tw-flex tw-items-center">
                                                <span
                                                    className={clsx(
                                                        selected &&
                                                            "tw-font-semibold",
                                                        !selected &&
                                                            "tw-font-normal",
                                                        "tw-block tw-truncate"
                                                    )}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                        )}
                                    </Listbox.Option>
                                );
                            })}
                        </Listbox.Options>
                    </Transition>
                </div>
            )}
        </Listbox>
    );
}
