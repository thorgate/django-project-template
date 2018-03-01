import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Helmet from 'react-helmet';
import {Row, Col, Button} from 'reactstrap';

import withView from 'decorators/withView';
import {setActiveLanguage} from 'ducks/user';
import {ngettext, interpolate} from 'utils/i18n';


const translated = () => {
    const waybillCount = 1;
    const format = ngettext('There is %s more stuff', 'There are %s more stuff', waybillCount);
    return interpolate(format, waybillCount);
};

const Home = ({onActivateLanguage}) => (
    <div className="page-container">
        <Helmet title="Home" />
        <Row>
            <Col md={12}>
                Hi, Im home<br />
                {translated()}
            </Col>
            <Col md={12}>
                <Button onClick={() => onActivateLanguage('en')} className="mr-2">EN</Button>
                <Button onClick={() => onActivateLanguage('et')}>ET</Button>
            </Col>
        </Row>
    </div>
);

Home.propTypes = {
    onActivateLanguage: PropTypes.func.isRequired,
};


const mapDispatchToProps = dispatch => ({
    onActivateLanguage: language => dispatch(setActiveLanguage(language)),
});

const HomeConnector = connect(
    null,
    mapDispatchToProps,
)(Home);


const HomeAsPage = withView()(HomeConnector);

export default HomeAsPage;
