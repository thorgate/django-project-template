export default function koaDevware(dev, compiler) {
    const waitMiddleware = () =>
        new Promise((resolve, reject) => {
            dev.waitUntilValid(() => resolve(true));
            compiler.plugin('failed', error => reject(error));
        });

    return async (ctx, next) => {
        await waitMiddleware();
        await dev(
            ctx.req,
            {
                end(content) {
                    ctx.body = content;
                },
                setHeader: ctx.set.bind(ctx),
                locals: ctx.state,
            },
            next,
        );
    };
}
