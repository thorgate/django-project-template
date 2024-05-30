const useRouter = jest.fn();

jest.mock("next/router", () => ({
    useRouter,
}));

// setup a new mocking function for push method
const pushMock = jest.fn();

// mock a return value on useRouter
useRouter.mockReturnValue({
    query: {},
    push: pushMock,
});
