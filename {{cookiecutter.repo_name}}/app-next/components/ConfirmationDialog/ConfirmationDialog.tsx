import { Fragment, useRef } from "react";
import { useTranslation } from "next-i18next";

import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export interface ConfirmationDialogProps {
    title: string;
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    children: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
}

export const ConfirmationDialog = ({
    title,
    open,
    onConfirm,
    onCancel,
    children,
    confirmLabel,
    cancelLabel,
    isDangerous = true,
}: ConfirmationDialogProps) => {
    const { t } = useTranslation(["common"]);
    const cancelButtonRef = useRef(null);

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                initialFocus={cancelButtonRef}
                onClose={onCancel}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="sm:flex sm:items-start">
                                    {isDangerous ? (
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-600 text-red-600 dark:text-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <ExclamationTriangleIcon
                                                className="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    ) : null}
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100"
                                        >
                                            {title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {children}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className={clsx(
                                            "inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto",
                                            isDangerous
                                                ? "bg-red-600 hover:bg-red-500"
                                                : "bg-green-600 hover:bg-green-500"
                                        )}
                                        onClick={onConfirm}
                                    >
                                        {confirmLabel ?? t("form.confirm")}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 sm:mt-0 sm:w-auto"
                                        onClick={onCancel}
                                        ref={cancelButtonRef}
                                    >
                                        {cancelLabel ?? t("form.cancel")}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};
