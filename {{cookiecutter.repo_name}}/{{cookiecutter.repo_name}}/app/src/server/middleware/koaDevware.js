export default function koaDevware(dev, compiler) {
    function waitMiddleware() {
        return new Promise((resolve, reject) => {
            dev.waitUntilValid(() => {
                resolve(true);
            });

            function tapFailedHook(comp) {
                comp.hooks.failed.tap('koaDevware', (error) => {
                    reject(error);
                });
            }

            if (compiler.compilers) {
                for (const child of compiler.compilers) {  // eslint-disable-line
                    tapFailedHook(child);
                }
            } else {
                tapFailedHook(compiler);
            }
        });
    }

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
