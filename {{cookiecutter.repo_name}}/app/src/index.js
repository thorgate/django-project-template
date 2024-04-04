/* eslint-disable */
import http from "http";

import { SETTINGS } from "@/src/settings";

const createServer = () => {
    const PORT = process.env.PORT;

    const app = require("./server").default;
    const currentHandler = app.callback();

    const server = http.createServer(currentHandler);

    server.listen(PORT, (error) => {
        if (error) {
            console.log(error);
        }

        if (process.env.NODE_ENV !== "production") {
            console.log(`Application started on ${PORT}`);
            console.log(
                `==> Listening on port ${PORT}. Open up ${process.env.RAZZLE_SITE_URL} in your browser.`
            );
        }
    });

    return { server, currentHandler };
};

if (process.env.NODE_ENV === "production" && SETTINGS.MAX_WORKERS > 1) {
    const throng = require("throng");

    throng({
        workers: SETTINGS.MAX_WORKERS,
        start: (id) => {
            console.log(`Booting worker: ${id}`);
            createServer();
        },
    });
} else {
    let { server, currentHandler } = createServer();

    if (module.hot) {
        console.log("✅ Server-side HMR Enabled!");

        module.hot.accept("./server", () => {
            console.log("🔁  HMR Reloading `./server`...");

            try {
                const app = require("./server").default;
                const newHandler = app.callback();
                server.removeListener("request", currentHandler);
                server.on("request", newHandler);
                currentHandler = newHandler;
            } catch (error) {
                console.error(error);
            }
        });
    }
}
