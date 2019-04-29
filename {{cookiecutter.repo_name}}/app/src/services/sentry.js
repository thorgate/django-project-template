import * as Sentry from '@sentry/browser';


export const onComponentError = (error, errorInfo) => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error);
    } else {
        console.error(error);

        if (errorInfo) {
            console.error(errorInfo);
        }
    }
};


export default Sentry;
