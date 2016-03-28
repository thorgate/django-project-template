import alt from '../alt';
import {createStore} from '../alt';

import SingleObjectResource, {InvalidResponseCode} from '../resources/GenericResource';
import CurrentUserActions from '../actions/CurrentUserActions';


const CurrentUserSource = {
    getCurrentUser() {
        return {
            remote(state, lang) {
                return new Promise((resolve, reject) => {
                    new SingleObjectResource(DJ_CONST.API.apiUserDetails).fetch().then((data) => {
                        var {email, name, phone_number} = data;

                        var profile = {};
                        Object.keys(data).forEach((key) => {
                            profile[key] = data[key];
                        });

                        resolve({email, name, phone_number, profile, language: lang});

                    }, (error) => {
                        if (error.statusCode !== 403) {
                            // Trigger a global error
                            CurrentUserActions.pageFault(error);
                            reject({language: lang});
                        } else {
                            reject({language: lang});
                        }
                    }).catch((error) => {
                        // Trigger a global error
                        CurrentUserActions.pageFault(error);
                        reject({language: lang});
                    });
                });
            },

            local(state) {
                // So we don't do the call again when rendering clientside
                // Note: We may want to recheck from backend after certain time interval
                return state.cacheTimestamp ? state : null;
            },

            success: CurrentUserActions.receivedCurrentUser,
            error: CurrentUserActions.failedCurrentUser
        };
    },

    logout() {
        return {
            remote() {
                return new SingleObjectResource(DJ_CONST.API.apiUserLogout).post();
            },

            success: CurrentUserActions.logout,
            error: CurrentUserActions.pageFault
        };
    },

    login() {
        return {
            remote(state, loginData) {
                return new Promise((resolve, reject) => {
                    new SingleObjectResource(DJ_CONST.API.apiUserLogin).post(null, loginData).then((data) => {
                        resolve(data);

                    }).catch((error) => {
                        // If we get something other than 400, lets trigger a pageFault
                        if (error.statusCode !== 400) {
                            CurrentUserActions.pageFault(error);
                        }

                        // Trigger a login error
                        reject({error, loginData});
                    });
                });
            },

            success: CurrentUserActions.didLogin,
            error: CurrentUserActions.failLogin
        };
    },

    register() {
        return {
            remote(state, registerData) {
                return new Promise((resolve, reject) => {
                    new SingleObjectResource(DJ_CONST.API.apiUserRegister).post(null, registerData).then((data) => {
                        resolve(data);

                    }).catch((error) => {
                        // If we get something other than 400, lets trigger a pageFault
                        if (error.statusCode !== 400) {
                            CurrentUserActions.pageFault(error);
                        }

                        // Trigger a registering error
                        reject({error, registerData});
                    });
                });
            },

            success: CurrentUserActions.didRegister,
            error: CurrentUserActions.failRegister
        };
    }
};


class CurrentUserStore {
    constructor() {
        this.activeLanguage = null;
        this.isAuthenticated = false;
        this.profile = {};
        this.loginError = {};
        this.registerError = {};

        this.exportAsync(CurrentUserSource);
        this.bindActions(CurrentUserActions);
        this.exportPublicMethods({
            hasLoaded: this.hasLoaded
        });
    }

    hasLoaded() {
        return !!this.getState().cacheTimestamp;
    }

    onReceivedCurrentUser(user) {
        this.cacheTimestamp = new Date().getTime() / 1000;
        this.activeLanguage = user.language;

        this.isAuthenticated = true;
        this.profile = user;
        this.loginError = {};
        this.registerError = {};

        this.profile.displayName = this.profile.name || this.profile.email;
    }

    onFailedCurrentUser(data) {
        this.cacheTimestamp = new Date().getTime() / 1000;
        this.activeLanguage = data.language;

        this.isAuthenticated = false;
        this.profile = {
            displayName: null
        };
    }

    onLogout() {
        // Force a reload so we don't have to worry
        //  about cleaning up sensitive data inside our stores
        window.location.reload();
    }

    onFailLogin(loginError) {
        this.setState(loginError);
    }

    onFailRegister(registerError) {
        this.setState(registerError);
    }

    onPageFault(pageFault) {
        this.setState(pageFault);

        if (process.env.NODE_ENV !== 'production') {
            console.error('pageFault', pageFault.message, pageFault.stack);
        }

        // Only do the logging if
        if (!(pageFault instanceof InvalidResponseCode) || [400, 403, 404].indexOf(pageFault.statusCode) === -1) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('pageFault: Snapshot', JSON.stringify(alt.takeSnapshot()));
            }
        }
    }
}

export default createStore(CurrentUserStore, 'CurrentUserStore', module);
