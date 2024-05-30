import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import { listPageFactory } from "@lib/factories/ListPageFactory";
import { queriesApi, UserDetail } from "@lib/queries";
import { ProvidersWrapper } from "@lib/testUtils";

import { makeStore } from "@lib/store";
import { defaultPaginatedURLParameters } from "@lib/factories/ListPageFactory";
import { booleanQueryParameterExtractor } from "@lib/factories/util";

const DummyListView = ({ pageData }: { pageData: UserDetail[] }) => (
    <ul data-testid="user-list">
        {pageData.map((user) => (
            <li key={user.email}>{user.email}</li>
        ))}
    </ul>
);
const [UserListComponent, getExtraProps] = listPageFactory({
    retrieveEndpoint: queriesApi.endpoints.userList,
    parameters: [
        ...defaultPaginatedURLParameters,
        { type: "search", queryArg: "search", defaultValue: "" },
        {
            type: "select",
            queryArg: "isActive",
            label: "filters.titles.isActive",
            defaultValue: true,
            options: [
                { label: "filters.values.all", value: undefined },
                { label: "filters.values.active", value: true },
                { label: "filters.values.inactive", value: false },
            ],
            queryExtractor: booleanQueryParameterExtractor,
        },
    ],
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
        const store = makeStore({
            context: {},
        });
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
