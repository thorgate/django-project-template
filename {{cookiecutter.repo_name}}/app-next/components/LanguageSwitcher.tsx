import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Fragment, useCallback, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";

function capitalize(lang: string) {
    return lang.slice(0, 1).toUpperCase() + lang.slice(1);
}

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const { language: currentLanguage } = i18n;
    const router = useRouter();
    const locales = router.locales ?? [currentLanguage];

    const languageNames = useMemo(() => {
        return new Intl.DisplayNames([currentLanguage ?? "en"], {
            type: "language",
        });
    }, [currentLanguage]);

    const [value, setValue] = useState(i18n.language ?? "en");

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
                <div className="relative mr-2 w-28">
                    <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 text-black dark:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 outline-none bg-slate-50 dark:bg-slate-600 ring-slate-300 dark:ring-slate-700">
                        {capitalize(languageNames.of(value) ?? value)}
                    </Listbox.Button>

                    <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-opacity-5 sm:text-sm text-black dark:text-white outline-none bg-slate-50 dark:bg-slate-600 ring-slate-300 dark:ring-slate-700">
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
                                                    ? "bg-indigo-600 text-white"
                                                    : "text-gray-900 dark:text-gray-300",
                                                "relative cursor-default select-none py-2 pl-3 pr-9"
                                            )
                                        }
                                    >
                                        {({ selected }) => (
                                            <div className="flex items-center">
                                                <span
                                                    className={clsx(
                                                        selected &&
                                                            "font-semibold",
                                                        !selected &&
                                                            "font-normal",
                                                        "block truncate"
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
