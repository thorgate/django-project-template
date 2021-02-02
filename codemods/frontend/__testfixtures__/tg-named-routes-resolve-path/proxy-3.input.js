import { parse } from 'path';
import { urlResolve } from '../../configuration/routes';

urlResolve('landing:home');

print('TEST');

function getPath() {
    return urlResolve('landing:home');
}

const asPath = () => urlResolve('landing:home');
