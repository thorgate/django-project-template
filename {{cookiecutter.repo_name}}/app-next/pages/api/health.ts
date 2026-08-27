// Lightweight liveness/readiness endpoint for k8s probes.
// Returns 200 + {ok: true} as soon as the Next.js server is running -
// no DB, no upstream API, no rendering. Mirrors django's /_health
// (different path because Next.js API routes live under /api/).

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
    _req: NextApiRequest,
    res: NextApiResponse<{ ok: true }>,
) {
    res.status(200).json({ ok: true });
}
