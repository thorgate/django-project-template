// modified version of https://github.com/gpbl/isomorphic500/blob/master/webpack%2Futils%2Fwrite-stats.js
import fs from 'fs';
import path from 'path';

import logger from '../../src/logger';


const filepath = path.resolve(__dirname, '../../../stats.json');


export default function(stats) {
    const publicPath = this.options.output.publicPath;
    const json = stats.toJson({assets: true});

    // Declare a filter
    const filterFn = (chunk, ext) => {
        return ext.test(path.extname(chunk)) && // filter by extension
               path.basename(chunk) !== 'styles.js'; // filter out styles.js
    };

    // get chunks by name and extensions
    const getChunks = function(nameArr, ext = /.js$/) {
        let allChunks = [];

        nameArr.forEach((name) => {
            let chunks = json.assetsByChunkName[name];

            // a chunk could be a string or an array, so make sure it is an array
            if (!(Array.isArray(chunks))) {
                chunks = [chunks];
            }

            return chunks
                .filter(chunk => filterFn(chunk, ext))          // Filter them
                .map(chunk => `${publicPath}${chunk}`)          // add public path to it
                .forEach(chunk => allChunks.push(chunk));       // Add to allChunks
        });

        return allChunks;
    };

    const chunkNames = Object.keys(this.options.entry);
    const script = getChunks(chunkNames, /js/);
    const style = getChunks(chunkNames, /css/);

    // Find compiled images in modules for the server
    const imagesRegex = /\.(jpe?g|png|gif|svg)$/;
    const images = json.modules.filter(module => imagesRegex.test(module.name)).map(image => {
        return {
            original: image.name,
            compiled: `${publicPath}${image.assets[0]}`
        };
    });

    const content = {script, style, images};

    fs.writeFileSync(filepath, JSON.stringify(content));
    logger.debug('`stats.json` updated');
}
