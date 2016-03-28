import CurrentUserStore from '../stores/CurrentUserStore';
import getCsrfToken from './csrf';


export function getExtraHeaders() {
    if (typeof window !== 'undefined') {
        return {
            'X-CSRFToken': getCsrfToken()
        };
    }

    return {
        'X-Forwarded-For': CurrentUserStore.remoteAddress,
        'User-Agent': CurrentUserStore.userAgent
    };
}

export function getCookies() {
    if (typeof window !== 'undefined') {
        return {};
    }

    return CurrentUserStore.cookies;
}
