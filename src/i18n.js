
import i18n from 'i18next'
import XHR from 'i18next-xhr-backend'
import Cache from 'i18next-localstorage-cache'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(XHR)
  .use(Cache)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'zh',
    ns: ['common'],
    defaultNS: 'common',
    debug: false,
    wait: true,
    cache: {
      enabled: false,
      versions: {
        zh: '1'
      }
    },
    backend: {
      loadPath: process.env === 'development' ?
        '/assets/locales/{{lng}}/{{ns}}.json':
        '/geapm/react/reports/assets/locales/{{lng}}/{{ns}}.json' // dew watch
    },
    interpolation: {
      escapeValue: false, // not needed for react
      formatSeparator: ',',
      format: function(value, format, lng) {
        if (format === 'uppercase') return value.toUpperCase()
        return value
      }
    }
  })

export default i18n