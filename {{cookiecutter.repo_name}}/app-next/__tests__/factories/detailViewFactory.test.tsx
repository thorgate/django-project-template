import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import { detailPageFactory } from "@lib/factories/DetailPageFactory";
import { queriesApi, UserDetail } from "@lib/queries";
import { ProvidersWrapper } from "@lib/testUtils";

import { makeStore } from "@lib/store";

const DummyDetailView = ({ data }: { data: UserDetail }) => (
    <div>
        <span data-testid="email">{data.email}</span>
    </div>
);
const [UserDetailComponent, getExtraProps] = detailPageFactory({
    queryEndpoint: queriesApi.endpoints.userRetrieve,
    queryParameters: [
        {
            queryArg: "email",
            routeQueryArg: "queryPath",
            type: "hidden",
        },
    ],
    DetailView: DummyDetailView,
});

describe("detailViewFactory", () => {
    it("creates working user detail view", async () => {
        render(<UserDetailComponent />, {
            wrapper: ProvidersWrapper,
        });

        await waitFor(() =>
            expect(screen.getByTestId("email")).toBeInTheDocument()
        );
    });
    it("creates proper server side preloader", async () => {
        const store = makeStore({
            context: {},
        });
        await getExtraProps(store, { query: {} });

        render(
            <Provider store={store}>
                <UserDetailComponent />
            </Provider>
        );

        expect(screen.getByTestId("email")).toBeInTheDocument();
    });
});
