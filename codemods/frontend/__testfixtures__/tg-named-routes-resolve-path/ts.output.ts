import { resolvePath } from 'tg-named-routes';

resolvePath('landing:home');

function getPath() {
    return resolvePath('landing:home');
}

const asPath = () => resolvePath('landing:home');
