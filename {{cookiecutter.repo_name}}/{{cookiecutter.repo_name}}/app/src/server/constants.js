import path from 'path';
import fs from 'fs';


global.DJ_CONST = JSON.parse(fs.readFileSync(path.join('constants.json')));

export default DJ_CONST;
