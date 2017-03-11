const Polyglot = require('node-polyglot')
const Instance = require('../models/cozy_instance')

// Seeks the proper locale files, depending if we run from build/ or from sources
const path = require('path')
const LOCALE_PATH = path.resolve(__dirname, '../../client/app/locales/')

// Configure the Polyglot lib and returns the function that will handle
// all the translation (for a given key, it returns the right translation).
// All translations are stored in files. Each file is dedicated to a locale.
// The locale is set by the user in the Cozy platform and is stored in the
// CozyInstance object.
class LocalizationManager {
  static initClass () {
    this.prototype.polyglot = null
  }

  // Configure and returns the polyglot object depending on the
  // Run this function when the app starts.
  initialize (callback) {
    return this.retrieveLocale((err, locale) => {
      if (err != null) {
        return callback(err)
      } else {
        this.polyglot = this.getPolyglotByLocale(locale)
        return callback(null, this.polyglot)
      }
    }
    )
  }

  // Get locale from instance object. Returns "en" if no locale is found.
  retrieveLocale (callback) {
    return Instance.getLocale(function (err, locale) {
      if ((err != null) || !locale) { locale = 'en' } // default value
      return callback(err, locale)
    })
  }

  // Returns Polyglot object configured for the given locale.
  // Default locale is en.
  getPolyglotByLocale (locale) {
    let phrases
    try {
      phrases = require(`${LOCALE_PATH}/${locale}`)
    } catch (err) {
      phrases = require(`${LOCALE_PATH}/en`)
    }
    return new Polyglot({locale, phrases})
  }

  // execute polyglot.t, for server-side localization
  t (key, params) {
    if (params == null) {
      params = {}
    }
    return (this.polyglot != null ? this.polyglot.t(key, params) : undefined)
  }

  // for template localization
  getPolyglot () { return this.polyglot }
}
LocalizationManager.initClass()

module.exports = new LocalizationManager()
