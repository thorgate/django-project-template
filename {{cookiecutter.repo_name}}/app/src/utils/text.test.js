import { upperCaseFirst } from "./text";

describe("text utils", () => {
    test("upperCaseFirst test", () => {
        expect(upperCaseFirst("fasdASDASD ASD cada")).toBe(
            "Fasdasdasd asd cada"
        );
        expect(upperCaseFirst("")).toBe("");
    });
});
