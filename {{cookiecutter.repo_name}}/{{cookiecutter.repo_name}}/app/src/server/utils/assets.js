import {clearChunks, flushChunkNames} from 'react-universal-component/server';
import flushChunks from 'webpack-flush-chunks';


function isHeadScript(asset) {
    return asset.indexOf('runtime') !== -1 || asset.indexOf('vendors') !== -1 || asset.indexOf('styles') !== -1;
}


export default function collectAssets(ctx, clientStats) {
    // DEV: Use webpack-dev-middleware compiled version
    // Production: Use cached stats file

    const loadOrder = ['runtime~app', 'runtime~styles', 'vendors', 'app', 'styles'];
    const appendPublicPath = asset => `${clientStats.publicPath}${asset}`;

    let headScripts = [];
    let bodyScripts = [];
    let styles = [];
    let cssHashString = '';

    // When not pre-rendering, add all chunks
    if (ctx.state.noPreRender) {
        const {assetsByChunkName} = clientStats;

        const isScript = asset => asset.endsWith('.js');
        const isStyles = asset => asset.endsWith('.css');
        const appendAssets = (chunk) => {
            let chunks = chunk;
            if (!Array.isArray(chunks)) {
                chunks = [chunks];
            }

            const scripts = chunks.filter(isScript);

            headScripts = headScripts.concat(scripts.filter(isHeadScript));
            bodyScripts = bodyScripts.concat(scripts.filter(x => !isHeadScript(x)));
            styles = styles.concat(chunks.filter(isStyles));
        };

        loadOrder.forEach((chunkName) => {
            appendAssets(assetsByChunkName[chunkName]);
        });

        Object.entries(assetsByChunkName).forEach(([name, chunk]) => {
            if (loadOrder.find(key => name === key)) {
                return;
            }

            appendAssets(chunk);
        });
    } else {
        clearChunks();

        const {scripts, stylesheets, cssHash} = flushChunks(clientStats, {
            chunkNames: flushChunkNames(),
            before: loadOrder,
            after: [],
        });
        headScripts = scripts.filter(isHeadScript);
        bodyScripts = scripts.filter(x => !isHeadScript(x));
        styles = stylesheets;
        cssHashString = `${cssHash}`;
    }

    return {
        headScripts: headScripts.map(appendPublicPath),
        bodyScripts: bodyScripts.map(appendPublicPath),
        style: styles.map(appendPublicPath),
        cssHash: cssHashString,
    };
}
