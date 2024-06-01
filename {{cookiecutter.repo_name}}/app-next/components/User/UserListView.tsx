import React from "react";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

import type { UserDetail, UserListApiArg } from "@lib/queries";
import { DateTime } from "@components/Text";
import { ListViewProps } from "@lib/factories/types";
import { Button } from "@components/Button";
import { SortToggleButton } from "@components/Button/SortButton";
import type { PaginatedPageState } from "@lib/factories";

type sortColumn = "name" | "email" | "creationTime" | "lastModificationTime";

export interface UserListPageState extends PaginatedPageState {
    search: string;
    isActive: boolean | null;
    isStaff: boolean[];
    email: string;
    sort: UserListApiArg["sort"];
}

export const UserListView = ({
    pageData,
    pageState,
    setPageState,
}: ListViewProps<UserDetail, UserListPageState>) => {
    const { t } = useTranslation(["user", "common"]);
    const onToggleSort = React.useCallback(
        (fieldName: sortColumn) => {
            setPageState({
                sort:
                    pageState.sort === `${fieldName}Asc`
                        ? `${fieldName}Desc`
                        : `${fieldName}Asc`,
            });
        },
        [pageState.sort, setPageState]
    );

    const getIsSortActiveForColumn = React.useCallback(
        (fieldName: sortColumn) => {
            return (
                pageState.sort === `${fieldName}Asc` ||
                pageState.sort === `${fieldName}Desc`
            );
        },
        [pageState.sort]
    );

    return (
        <>
            <Head>
                <title>{`${t("common:pageTitles.userList")} - RainPaul`}</title>
            </Head>
            <div className="px-4 sm:px-6 lg:px-8 pt-1 mt-3 bg-white dark:bg-slate-900 text-black dark:text-white ">
                <div className="mt-8 flow-root">
                    <div className="flex flex-row-reverse">
                        <Button className="px-6" href={`/user/create`}>
                            {t("common:form.create")}
                        </Button>
                    </div>
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-500 table-fixed">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            className="w-1/4 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-0"
                                        >
                                            <SortToggleButton
                                                onToggleSort={() =>
                                                    onToggleSort("name")
                                                }
                                                label={t("user:name")}
                                                isActive={getIsSortActiveForColumn(
                                                    "name"
                                                )}
                                            />
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-1/4 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 "
                                        >
                                            <SortToggleButton
                                                onToggleSort={() =>
                                                    onToggleSort("email")
                                                }
                                                label={t("user:email")}
                                                isActive={getIsSortActiveForColumn(
                                                    "email"
                                                )}
                                            />
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-1/8 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 "
                                        >
                                            {t("user:active")}
                                        </th>
                                        <th
                                            scope="col"
                                            className="w-1/4 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 "
                                        >
                                            <SortToggleButton
                                                onToggleSort={() =>
                                                    onToggleSort("creationTime")
                                                }
                                                label={t("user:dateJoined")}
                                                isActive={getIsSortActiveForColumn(
                                                    "creationTime"
                                                )}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {pageData
                                        ? pageData.map((user) => (
                                              <tr key={user.email}>
                                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                      <Link
                                                          href={`/user/detail/${user.email}`}
                                                          className="text-indigo-900 hover:text-indigo-600 dark:text-indigo-100 dark:hover:text-indigo-400"
                                                      >
                                                          {user.name ||
                                                              t("user:unnamed")}
                                                      </Link>
                                                  </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                      {user.email}
                                                  </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                      {user.isActive ? (
                                                          <CheckCircleIcon
                                                              className="h-5 w-5 text-green-500 dark:text-green-700"
                                                              aria-checked="true"
                                                          />
                                                      ) : (
                                                          <XCircleIcon
                                                              className="h-5 w-5 text-red-500 dark:text-red-700"
                                                              aria-checked="false"
                                                          />
                                                      )}
                                                  </td>
                                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                      <DateTime>
                                                          {user.created}
                                                      </DateTime>
                                                  </td>
                                              </tr>
                                          ))
                                        : null}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
