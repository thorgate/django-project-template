import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";
import { server } from "@mock/api/server";
import "@mock/i18next";
import "@mock/nextRouter";

Object.assign(global, { TextDecoder, TextEncoder });

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => server.close());
