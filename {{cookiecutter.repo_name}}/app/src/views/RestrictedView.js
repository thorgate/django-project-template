import React from 'react';
import { Helmet } from 'react-helmet';
import { Row, Col } from 'reactstrap';

import withView from 'decorators/withView';
import { loginRequired } from 'decorators/permissions';


const Restricted = () => (
    <div className="page-container">
        <Helmet title="Example" />
        <Row>
            <Col md={12}>
                Hi, I require logged in permissions
                <br />
            </Col>
        </Row>
    </div>
);


const RestrictedView = withView()(loginRequired()(Restricted));

export default RestrictedView;
