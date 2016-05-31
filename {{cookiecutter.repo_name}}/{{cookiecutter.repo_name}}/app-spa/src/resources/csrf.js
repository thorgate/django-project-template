import _ from 'lodash';


/**
 * Get csrf token
 */
export default function getCsrfToken() {
    if (typeof window !== 'undefined') {
        const name = 'csrftoken';

        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = _.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    return decodeURIComponent(cookie.substring(name.length + 1));
                }
            }
        }
    }

    return '';
}
