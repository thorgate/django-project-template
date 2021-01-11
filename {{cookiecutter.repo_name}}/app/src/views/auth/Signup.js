import { ConnectedRedirect } from '@thorgate/spa-pending-data';
import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { resolvePath } from 'tg-named-routes';

import AuthLayout from 'components/layouts/AuthLayout';
import SignupForm from 'forms/auth/Signup';
import withView from 'decorators/withView';
import { signup } from 'sagas/auth/signupSaga';
import { RouterLocationShape } from 'utils/types';

const Signup = ({ location, isAuthenticated, onSignup }) => {
    const { t } = useTranslation();

    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const { permissionDenied } = location.state || {};

    if (isAuthenticated && !permissionDenied) {
        let nextUrl = resolvePath('landing');
        if (query.next && query.next !== resolvePath('auth:login')) {
            nextUrl = query.next;
        }

        return <ConnectedRedirect to={nextUrl} />;
    }

    return (
        <AuthLayout>
            <Helmet>
                <title>{t('Signup')}</title>
            </Helmet>
            <SignupForm onSignup={onSignup} />
        </AuthLayout>
    );
};

Signup.propTypes = {
    onSignup: PropTypes.func.isRequired,
    location: RouterLocationShape.isRequired,
    isAuthenticated: PropTypes.bool,
};

Signup.defaultProps = {
    isAuthenticated: false,
};

const mapDispatchToProps = {
    onSignup: signup,
};

export default withView()(connect(null, mapDispatchToProps)(Signup));
