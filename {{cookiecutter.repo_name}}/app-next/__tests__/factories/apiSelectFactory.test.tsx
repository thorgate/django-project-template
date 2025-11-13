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
        render(<SelectUser label="Select user" onChange={() => []} />, {
            wrapper: ProvidersWrapper,
        });

        const comboboxInput = screen.getByRole("combobox", {
            name: "Select user",
        });
        expect(comboboxInput).toBeInTheDocument();

        fireEvent.click(comboboxInput);
        fireEvent.change(comboboxInput, {
            target: { value: "test" },
        });

        // Wait for the options to load from API, at least one option should load
        await waitFor(() =>
            expect(screen.getByRole("listbox").children.length).toBeGreaterThan(
                1,
            ),
        );
    });
});
