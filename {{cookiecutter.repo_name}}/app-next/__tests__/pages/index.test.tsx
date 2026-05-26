import { render, screen } from "@testing-library/react";
import { ProvidersWrapper } from "@lib/testUtils";
import { server } from "@mock/api/server";
import Home from "@/pages/index";

describe("Home", () => {
    it("renders a heading", () => {
        server.use();

        render(<Home />, { wrapper: ProvidersWrapper });

        const heading = screen.getByTestId("welcome");
        expect(heading).toBeInTheDocument();
    });
});
