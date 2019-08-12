import { getContext } from 'redux-saga/effects';

export const getTranslations = () => (
    getContext('i18n')
);
