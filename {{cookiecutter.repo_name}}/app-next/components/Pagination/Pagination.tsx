{%- raw -%}
import React from "react";
import { Trans, useTranslation } from "next-i18next";
import { PaginationLink } from "./PaginationLink";
import { RetrieveQueryPageOnlyResult } from "@lib/factories/types";

export interface PaginationProps {
    data?: RetrieveQueryPageOnlyResult;
    setPageNumber: (pageNumber: string | undefined) => void;
}

type PageNumber =
    | string // Regular page (i.e. one that requires page number in URL)
    | undefined // Page with no explicit number required in URL (i.e. first/default page)
    | null; // No page (i.e. page past the last one)

/* If page is undefined or null, consider that the page does not exist.
 * If page is empty object (or at least does not contain pageNumber), it is first page (which has no query parameters).
 * Otherwise, it is a normal page.
 * */
const extractPageNumber = (
    args: { pageNumber?: number } | undefined | null
): PageNumber => {
    if (args === undefined || args === null) {
        return null;
    }
    if (!args.pageNumber) {
        return undefined;
    }
    return `${args.pageNumber}`;
};

export const Pagination = ({ data, setPageNumber }: PaginationProps) => {
    const { t } = useTranslation("common");

    const previousPageNumber = extractPageNumber(data?.previous);
    const nextPageNumber = extractPageNumber(data?.next);

    const pageSize = data?.current?.pageSize;
    const pageNumber = data?.current?.pageNumber;
    const totalCount = data?.totalCount;

    const firstItem =
        pageNumber && pageSize ? (pageNumber - 1) * pageSize + 1 : undefined;

    const lastItem =
        pageNumber && pageSize && totalCount
            ? Math.min(pageNumber * pageSize, totalCount)
            : undefined;

    const onNextPage = React.useMemo(
        () =>
            nextPageNumber !== null
                ? () => setPageNumber(nextPageNumber ?? undefined)
                : null,
        [nextPageNumber, setPageNumber]
    );
    const onPreviousPage = React.useMemo(
        () =>
            previousPageNumber !== null
                ? () => setPageNumber(previousPageNumber ?? undefined)
                : null,
        [previousPageNumber, setPageNumber]
    );

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:border-gray-800 dark:bg-gray-800 dark:border-gray-600">
            <nav
                className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6"
                aria-label="Pagination"
            >
                <div className="hidden sm:block">
                    {firstItem && lastItem && totalCount ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <Trans i18nKey="pagination.paginationShownItems">
                                Showing {{ firstItem }} to {{ lastItem }} of{" "}
                                {{ totalCount }} results.
                            </Trans>
                        </p>
                    ) : null}
                </div>
                <div className="flex flex-1 justify-between sm:justify-end">
                    <PaginationLink onClick={onPreviousPage || undefined}>
                        {t("pagination.previousPage")}
                    </PaginationLink>
                    <PaginationLink onClick={onNextPage || undefined}>
                        {t("pagination.nextPage")}
                    </PaginationLink>
                </div>
            </nav>
        </div>
    );
};
{%- endraw %}
