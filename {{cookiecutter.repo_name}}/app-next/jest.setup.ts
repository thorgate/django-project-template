import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";
import { server } from "@mock/api/node";
import "@mock/i18next";
import "@mock/nextRouter";

const ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

Object.assign(global, { TextDecoder, TextEncoder, ResizeObserver });

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => server.close());
