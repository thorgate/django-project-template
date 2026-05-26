import { expect, describe, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";

import Home from "../../pages/new-index";

import { wrapper } from "../../lib/store";

// eslint-disable-next-line
function ProvidersWrapper({ children }) {
    const store = wrapper.useStore();

    return <Provider store={store}>{children}</Provider>;
}

describe("Home", () => {
    it("renders a heading", () => {
        render(<Home />, { wrapper: ProvidersWrapper });

        const heading = screen.getByTestId("welcome", {
            name: /welcome/i,
        });

        expect(heading).toBeInTheDocument();
    });
});
