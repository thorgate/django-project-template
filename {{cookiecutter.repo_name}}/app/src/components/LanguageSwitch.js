import React, { useCallback } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "reactstrap";

import { setActiveLanguage } from "@/src/sagas/user/activateLanguage";
import i18nSettings from "@/i18n.json";

const LanguageSwitch = ({ onSwitch }) => {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const changeLanguage = useCallback(
        (language) => {
            i18n.changeLanguage(language, () => {
                onSwitch(language);
            });
        },
        [i18n, onSwitch]
    );

    return (
        <>
            <p>
                {t("Active language")}: {SETTINGS.LANGUAGES[router.locale]}
            </p>
            {i18nSettings.LANGUAGES.map((languageCode) => (
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
