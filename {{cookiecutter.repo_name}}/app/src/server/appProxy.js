import koaProxies from 'koa-proxies';


export default (app, proxyMap) => {
    Object.keys(proxyMap).forEach((context) => {
        const mappingUrl = proxyMap[context];

        if (!mappingUrl) {
            // eslint-disable-next-line no-console
            console.log(`Invalid mapping url : ${mappingUrl}`);
            return;
        }

        app.use(koaProxies(context, { target: mappingUrl, changeOrigin: true, logs: true }));
    });
};
