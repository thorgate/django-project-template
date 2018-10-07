import { ConnectedRedirect } from '@thorgate/spa-pending-data';
import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import AuthLayout from 'components/layouts/AuthLayout';
import { urlResolve } from 'configuration/routes';
import SignupForm from 'forms/auth/Signup';
import withView from 'decorators/withView';
import { signup } from 'sagas/auth/signupSaga';
import { pgettext } from 'utils/i18n';
import { RouterLocationShape } from 'utils/types';


const Signup = ({ location, isAuthenticated, onSignup }) => {
    const query = qs.parse(location.search);
    const { permissionDenied } = location.state || {};

    if (isAuthenticated && !permissionDenied) {
        let nextUrl = urlResolve('landing');
        if (query.next && query.next !== urlResolve('auth:login')) {
            nextUrl = query.next;
        }

        return (
            <ConnectedRedirect to={nextUrl} />
        );
    }

    return (
        <AuthLayout>
            <Helmet>
                <title>{pgettext('view', 'Signup')}</title>
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


const mapDispatchToProps = (dispatch) => ({
    onSignup: (payload) => (
        dispatch(signup(payload))
    ),
});


export default withView()(connect(
    null,
    mapDispatchToProps,
)(Signup));
