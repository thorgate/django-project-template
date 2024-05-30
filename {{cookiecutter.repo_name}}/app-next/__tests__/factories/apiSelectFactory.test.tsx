import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { apiSelectFactory } from "@lib/factories/ApiSelectFactory";
import { queriesApi, UserDetail } from "@lib/queries";
import type { ApiSelectOption } from "@lib/factories/types";
import { ProvidersWrapper } from "@lib/testUtils";

const SelectUser = apiSelectFactory({
    retrieveEndpoint: queriesApi.endpoints.userList,
    getSearchQueryArgs: (query) => ({ search: query }),
    getOptionForItem: (item: UserDetail): ApiSelectOption<string> => ({
        key: item.email,
        value: item.email,
        label: `${item.name} (${item.email})`,
        displayValue: item.name,
    }),
});

describe("apiSelectFactory", () => {
    it("creates working user filter", async () => {
        render(<SelectUser onChange={() => []} testId="user-select" />, {
            wrapper: ProvidersWrapper,
        });

        const selectUserElement = screen.getByTestId("user-select");
        expect(selectUserElement).toBeInTheDocument();

        const comboboxButton = screen.getByTestId("combobox-button");
        expect(comboboxButton).toBeInTheDocument();
        fireEvent.click(comboboxButton);
        // By default, no options are loaded before the use expands the select; however in test environment
        // InteractionObserver is not available, so it will just render
        expect(screen.getByText("errors.loading")).toBeInTheDocument();

        const comboboxInput = screen.getByTestId("combobox-input");
        fireEvent.change(comboboxInput, {
            target: { value: "test" },
        });

        // Wait for the options to load from API, at least one option should load and load more button should be visible
        // as well
        await waitFor(() =>
            expect(
                screen.getByTestId("combobox-options").children.length
            ).toBeGreaterThan(1)
        );
    });
});
