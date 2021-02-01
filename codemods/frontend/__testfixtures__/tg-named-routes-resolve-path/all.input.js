import { resolvePath as urlResolve } from 'tg-named-routes';

urlResolve('landing:home');

print('TEST');

function getPath() {
    return urlResolve('landing:home');
}

const asPath = () => urlResolve('landing:home');
