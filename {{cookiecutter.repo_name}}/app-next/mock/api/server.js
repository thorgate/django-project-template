import { fetch, Headers, Request, Response } from "cross-fetch";
import { setupServer } from "msw/node";

import { handlers } from "./handlers.generated";

/* Mocked API for tests is generated with help of msw-auto-mock based on schema. To re-generate, do `make api` */

global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

export const server = setupServer(...handlers);
