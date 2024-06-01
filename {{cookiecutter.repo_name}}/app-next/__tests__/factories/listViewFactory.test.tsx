import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import {
    listPageFactory,
    PaginatedPageState,
} from "@lib/factories/ListPageFactory";
import { queriesApi, UserDetail, UserListApiArg } from "@lib/queries";
import { ProvidersWrapper } from "@lib/testUtils";

import { makeStore } from "@lib/store";
import { paginationState } from "@lib/factories/ListPageFactory";
import { booleanQueryParameterExtractor } from "@lib/factories/util";

const DummyListView = ({ pageData }: { pageData: UserDetail[] }) => (
    <ul data-testid="user-list">
        {pageData.map((user) => (
            <li key={user.email}>{user.email}</li>
        ))}
    </ul>
);
const [UserListComponent, getExtraProps] = listPageFactory<
    UserDetail,
    UserListApiArg,
    {
        search: string;
        isActive: boolean | null;
    } & PaginatedPageState
>({
    retrieveEndpoint: queriesApi.endpoints.userList,
    extraQueryArgument: {},
    pageStateDefinition: {
        ...paginationState,
        search: {
            defaultValue: "",
            isFilter: true,
            api: {
                key: "search",
            },
            url: {
                key: "search",
                serializer: (v) => [v],
                deserializer: (v) => v[0],
            },
            widget: {
                label: "Search",
                deserializer: (value: string) => value,
                index: 10,
            },
        },
        isActive: {
            defaultValue: null,
            isFilter: true,
            api: {
                key: "isActive",
                serializer: (v) => v ?? undefined,
            },
            url: {
                key: "isActive",
                serializer: (v) => (v === null ? [] : [`${v}`]),
                deserializer: (v) => `${v[0]}`.toLowerCase() === "true",
            },
            widget: {
                label: "Is Active?",
                options: [
                    { label: "All", value: null },
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                ],
                index: 20,
            },
        },
    },
    ListView: DummyListView,
});

describe("listPageFactory", () => {
    it("creates working user detail view", async () => {
        render(<UserListComponent />, {
            wrapper: ProvidersWrapper,
        });

        await waitFor(() =>
            expect(
                screen.getByTestId("user-list").children.length
            ).toBeGreaterThan(0)
        );
    });
    it("creates proper server side preloader", async () => {
        const store = makeStore({});
        await getExtraProps(store, { query: {} });

        render(
            <Provider store={store}>
                <UserListComponent />
            </Provider>
        );

        expect(screen.getByTestId("user-list").children.length).toBeGreaterThan(
            0
        );
    });
});
