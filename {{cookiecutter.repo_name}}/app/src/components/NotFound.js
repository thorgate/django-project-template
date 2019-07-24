import { PageError } from '@thorgate/spa-components';
import React from 'react';
import { useTranslation } from 'react-i18next';


const NotFound = () => {
    const { t } = useTranslation();
    return (
        <PageError
            clear
            statusCode={404}
            title={t('Page not Found')}
            description={t('Page not Found')}
        />
    );
};


export default NotFound;
