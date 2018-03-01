export default (allowedHosts = ['127.0.0.1', 'localhost']) => (
    async (ctx, next) => {
        if (Array.isArray(allowedHosts) && allowedHosts.includes(ctx.hostname)) {
            await next();
        } else {
            const err = new Error(`Hostname "${ctx.hostname}" not allowed, check setting`);
            err.status = 500;
            err.expose = true;
            throw err;
        }
    }
);
