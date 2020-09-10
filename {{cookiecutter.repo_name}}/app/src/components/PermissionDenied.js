import { PageError } from '@thorgate/spa-components';
import React from 'react';
import { useTranslation } from 'react-i18next';

const PermissionDenied = () => {
    const { t } = useTranslation();
    return (
        <PageError
            statusCode={403}
            title={t('Insufficient permissions')}
            description={t("You don't have permissions to access this page")}
        />
    );
};

export default PermissionDenied;
