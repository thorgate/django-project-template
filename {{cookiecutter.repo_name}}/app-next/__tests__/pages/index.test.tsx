import { render, screen } from "@testing-library/react";
import Home from "@/pages/index";
import { ProvidersWrapper } from "@lib/testUtils";
import { server } from "@mock/api/server";

describe("Home", () => {
    it("renders a heading", () => {
        server.use();

        render(<Home />, { wrapper: ProvidersWrapper });

        const heading = screen.getByTestId("welcome");
        expect(heading).toBeInTheDocument();
    });
});
