import * as Sentry from '@sentry/react';

export const onComponentError = (error, errorInfo) => {
    if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error);
    } else {
        // eslint-disable-next-line no-console
        console.error(error);

        if (errorInfo) {
            // eslint-disable-next-line no-console
            console.error(errorInfo);
        }
    }
};

export default Sentry;
