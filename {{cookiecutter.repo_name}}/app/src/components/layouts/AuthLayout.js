import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Container, Row, Col, Card } from 'reactstrap';


const AuthLayout = ({ children }) => (
    <Fragment>
        <Helmet defaultTitle="Authentication" />
        <Container>
            <Row>
                <Col lg={8} className="py-5 ml-auto mr-auto">
                    <Card body>
                        {children}
                    </Card>
                </Col>
            </Row>
        </Container>
    </Fragment>
);

AuthLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthLayout;
