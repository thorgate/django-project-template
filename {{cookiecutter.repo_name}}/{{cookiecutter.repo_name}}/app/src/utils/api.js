import Router, {Resource} from 'tg-resources';
import {getCookie} from 'utils/cookie';

const resources = Object.entries(DJ_CONST.API || {})
    .filter(item => item[0] !== 'apiRoot')
    .reduce((result, [key, url]) => {
        result[key] = new Resource(url); // eslint-disable-line no-param-reassign
        return result;
    }, {});


const api = new Router(
    resources,
    {
        apiRoot: DJ_CONST.API_BASE,
        headers: () => ({
            Accept: 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        }),
        withCredentials: true,
    },
);

export default api;
