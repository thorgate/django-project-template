import alt from '../alt';

import {getLoginRedirectUrl} from '../utils/authViewHelpers';
import SingleObjectResource from '../resources/GenericResource';


class CurrentUserActions {
    constructor() {
        this.generateActions('receivedCurrentUser', 'failedCurrentUser', 'logout');
    }

    pageFault(pageFault) {
        this.dispatch({pageFault});
    }

    didLogin() {
        // Force a redirect on login since it re-renders most of the page
        const newPath = getLoginRedirectUrl();

        // Chrome will ignore it if location is the same
        if (window.location !== newPath) {
            window.location = newPath;
        } else {
            window.location.reload();
        }
    }

    failLogin(loginError) {
        this.dispatch({loginError});
    }

    didRegister() {
        // Force a redirect on register since it re-renders most of the page
        const newPath = getLoginRedirectUrl();

        // Chrome will ignore it if location is the same
        if (window.location !== newPath) {
            window.location = newPath;
        } else {
            window.location.reload();
        }
    }

    failRegister(registerError) {
        this.dispatch({registerError});
    }

    changeLanguage(theLanguage) {
        if (typeof window !== 'undefined') {
            new SingleObjectResource(DJ_CONST.API.apiUserLanguage).put(null, {language_code: theLanguage}).then(() => {
                window.location.reload();
            });
        }
    }
}

export default alt.createActions(CurrentUserActions);
