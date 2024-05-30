import React from "react";
import Head from "next/head";

import { useTranslation } from "next-i18next";
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

import { useRouter } from "next/router";
import { queriesApi, UserListApiArg } from "@lib/queries";
import { DateTime } from "@components/Text";
import { ListQueryArgFromEndpoint } from "@components/ListFilter/types";
import {
    HiddenURLParameterSpecification,
    ListViewPropsFromEndpoint,
} from "@lib/factories/types";
import { Button } from "@components/Button";
import { SortToggleButton } from "@components/Button/SortButton";

export const userListSortParameter: HiddenURLParameterSpecification<
    ListQueryArgFromEndpoint<typeof queriesApi.endpoints.userList>,
    "sort"
> = {
    type: "hidden",
    queryArg: "sort",
    defaultValue: "nameAsc" as UserListApiArg["sort"],
    queryExtractor: (queryValues) =>
        (queryValues[0] as UserListApiArg["sort"]) ?? "creationTimeAsc",
    querySerializer: (value) => [value ?? "creationTimeAsc"],
};

type sortColumn = "name" | "email" | "creationTime" | "lastModificationTime";

export const UserListView = ({
    pageData,
    queryParameters,
    replaceQueryParameter,
}: ListViewPropsFromEndpoint<typeof queriesApi.endpoints.userList>) => {
    const { t } = useTranslation(["user", "common"]);
    const router = useRouter();

    const onToggleSort = React.useCallback(
        (fieldName: sortColumn) => {
            replaceQueryParameter({
                parameter: userListSortParameter,
                value:
                    queryParameters.sort === `${fieldName}Asc`
                        ? `${fieldName}Desc`
                        : `${fieldName}Asc`,
                router,
            });
        },
        [replaceQueryParameter, router, queryParameters.sort]
    );

    const getIsSortActiveForColumn = React.useCallback(
        (fieldName: sortColumn) => {
            return (
                queryParameters.sort === `${fieldName}Asc` ||
                queryParameters.sort === `${fieldName}Desc`
            );
        },
        [queryParameters.sort]
    );

    return (
        <>
            <Head>
                <title>{`${t(
                    "common:pageTitles.userList"
                )} - {{ cookiecutter.project_title }}`}</title>
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
