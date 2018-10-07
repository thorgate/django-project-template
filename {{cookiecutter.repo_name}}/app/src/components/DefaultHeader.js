import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import SETTINGS from 'settings';
import { selectors as appSelectors } from 'ducks/application';


const DefaultHeader = ({ activeLanguage, canonical }) => (
    <Helmet titleTemplate="%s - {{cookiecutter.project_title}}" defaultTitle="{{cookiecutter.project_title}}">
        <html lang={activeLanguage} />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet="utf-8" />
        <body className="bg-light" />
        <meta name="description" content="Default description" />
        <link rel="canonical" href={`${SETTINGS.SITE_URL}${canonical}`} />
    </Helmet>
);

DefaultHeader.propTypes = {
    activeLanguage: PropTypes.string.isRequired,
    canonical: PropTypes.string.isRequired,
};


const mapStateToProps = (state) => ({
    activeLanguage: appSelectors.activeLanguage(state),
});

export default connect(
    mapStateToProps,
)(DefaultHeader);
