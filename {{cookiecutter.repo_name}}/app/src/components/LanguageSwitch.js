import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'reactstrap';

import { setActiveLanguage } from 'sagas/user/activateLanguage';
import { SETTINGS } from 'settings';

const LanguageSwitch = ({ onSwitch }) => {
    const { t, i18n } = useTranslation();
    const changeLanguage = useCallback(
        (language) => {
            i18n.changeLanguage(language, () => {
                onSwitch(language);
            });
        },
        [i18n, onSwitch],
    );

    return (
        <>
            <p>
                {t('Active language')}: {SETTINGS.LANGUAGES[i18n.language]}
            </p>
            {SETTINGS.LANGUAGE_ORDER.map((languageCode) => (
                <Button
                    key={languageCode}
                    onClick={() => changeLanguage(languageCode)}
                    className="mr-2"
                >
                    {SETTINGS.LANGUAGES[languageCode]}
                </Button>
            ))}
        </>
    );
};

LanguageSwitch.propTypes = {
    onSwitch: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    onSwitch: setActiveLanguage,
};

export default connect(null, mapDispatchToProps)(LanguageSwitch);
