import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import {Row, Col} from 'reactstrap';

import LoginForm from 'forms/Login';
import withView from 'decorators/withView';
import {login} from 'sagas/user/loginSaga';
import {gettext} from 'utils/i18n';

import {RouterLocationShape} from 'utils/types';


const Login = ({location, isAuthenticated, onLogin}) => {
    const {from} = location.state || {from: {pathname: '/'}};

    if (isAuthenticated) {
        return (
            <Redirect to={from} />
        );
    }


    return (
        <div className="page-container">
            <Row>
                <Col md={4} className="ml-auto mr-auto">
                    <LoginForm onLogin={onLogin} />
                </Col>
            </Row>
        </div>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired,
    location: RouterLocationShape.isRequired,
    isAuthenticated: PropTypes.bool,
};

Login.defaultProps = {
    isAuthenticated: false,
};


const mapDispatchToProps = dispatch => ({
    onLogin: (...args) => dispatch(login(...args)),
});


const LoginConnector = connect(
    null,
    mapDispatchToProps,
)(Login);

const LoginAsView = withView(gettext('Login'))(LoginConnector);

export default LoginAsView;
