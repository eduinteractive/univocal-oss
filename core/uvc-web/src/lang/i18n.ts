import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './de.json';

const resources = {
    de: { translation: de },
};

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        resources,
        lng: 'de',
        debug: import.meta.env.MODE === 'development',
    });

export default { i18n };