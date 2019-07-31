import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import SETTINGS from 'settings';


const DefaultHeader = ({ canonical }) => {
    const { i18n } = useTranslation();

    return (
        <Helmet titleTemplate="%s - {{cookiecutter.project_title}}" defaultTitle="{{cookiecutter.project_title}}">
            <html lang={i18n.language} />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta charSet="utf-8" />
            <body className="bg-light" />
            <meta name="description" content="Default description" />
            <link rel="canonical" href={`${SETTINGS.SITE_URL}${canonical}`} />
        </Helmet>
    );
};

DefaultHeader.propTypes = {
    canonical: PropTypes.string.isRequired,
};

export default DefaultHeader;
