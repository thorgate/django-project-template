import path from 'path';
import fs from 'fs';


global.DJ_CONST = JSON.parse(fs.readFileSync(path.join('constants.json')));

// If constants.KOA_API_BASE is defined, overwrite constants.API_BASE with it
if (DJ_CONST.KOA_API_BASE) {
    DJ_CONST.API_BASE = DJ_CONST.KOA_API_BASE;
}

export default DJ_CONST;
