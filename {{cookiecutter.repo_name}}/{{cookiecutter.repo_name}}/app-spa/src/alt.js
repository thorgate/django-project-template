import Alt from 'alt';

const myAlt = new Alt();

if (typeof window !== 'undefined') {
    require('alt/utils/chromeDebug')(myAlt);
}

export function createStore(Store, name, theModule) {
    if (typeof theModule.hot === 'function') {
        theModule.hot.accept();

        theModule.hot.dispose(function() {
            delete myAlt.stores[name];
        });
    }

    return myAlt.createStore(Store, name);
}


export default myAlt;
