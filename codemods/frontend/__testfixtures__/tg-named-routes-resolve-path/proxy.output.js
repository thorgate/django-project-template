import { RenderChildren, resolvePath } from 'tg-named-routes';

resolvePath('landing:home');

print('TEST');

function getPath() {
    return resolvePath('landing:home');
}

const asPath = () => resolvePath('landing:home');
