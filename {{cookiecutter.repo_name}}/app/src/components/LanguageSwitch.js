import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { setActiveLanguage, selectors as appSelectors } from 'ducks/application';
import SETTINGS from 'settings';


const LanguageSwitch = ({ activeLanguage, onSwitch }) => (
    <Fragment>
        <p>
            Active language: {activeLanguage}
        </p>
        {SETTINGS.LANGUAGE_ORDER.map((languageCode) => (
            <Button key={languageCode} onClick={() => onSwitch(languageCode)} className="mr-2">
                {SETTINGS.LANGUAGES[languageCode]}
            </Button>
        ))}
    </Fragment>
);

LanguageSwitch.propTypes = {
    activeLanguage: PropTypes.string.isRequired,
    onSwitch: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => ({
    activeLanguage: appSelectors.activeLanguage(state),
});

const mapDispatchToProps = (dispatch) => ({
    onSwitch: (languageCode) => dispatch(setActiveLanguage(languageCode)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LanguageSwitch);
