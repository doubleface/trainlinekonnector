const async = require('async')
// const naming = require('./naming')
const moment = require('moment')
// const Folder = require('../models/folder')
// const File = require('../models/file')

// Fetcher layer that creates an object in database for each entry. If a field
// named pdfurl is is set on the entry, it downloads the file and creates a Cozy
// File in the folder given in the options object.
//
// It expects to find the list of entries in the "filtered" field. If the
// filtered field is null, it checks for the  "fetched" field.
module.exports = (log, model, options, tags) => {
  return function (requiredFields, entries, body, next) {
    const entriesToSave = entries.filtered || entries.fetched
    const path = requiredFields.folderPath

    const normalizedPath = path.charAt(0) === '/'
      ? path : `/${path}`

    // For each entry...
    return async.eachSeries(entriesToSave, function (entry, callback) {
      if (!(entry.date instanceof moment)) {
        log.info('Bill creation aborted')
        return callback('Moment instance expected for date field')
      }

      const entryLabel = entry.date.format('MMYYYY')
      // const fileName = naming.getEntryFileName(entry, options)

      const createFileAndSaveData = function (entry, entryLabel) {
        // Legacy code: Date is not used in File Model
        // const { pdfurl } = entry

        // return Folder.mkdirp(normalizedPath, function () {
        //   if (options.requestoptions) {
        //     options.requestoptions.entry = entry
        //   }
        //   return File.createNew(fileName, normalizedPath, pdfurl, tags,
        //       onCreated, options.requestoptions)
        // })
      }

      // var onCreated = function (err, file) {
      //   if (err) {
      //     log.raw(err)
      //     log.info(`File for ${entryLabel} not created.`)
      //     return callback()
      //   } else {
      //     log.info(`File for ${entryLabel} created: ${fileName}`)
      //     entry.fileId = file.id
      //     entry.binaryId = file.binary.file.id
      //     return saveEntry(entry, entryLabel)
      //   }
      // }

      var saveEntry = function (entry, entryLabel) {
        if ((entry.vendor == null)) {
          if (options.vendor) { entry.vendor = options.vendor }
        }

        // Only update the date format for the bills, to be able to
        // match correctly the bill with operations.
        if (entry.pdfurl != null) {
          let dateWithoutTimezone = entry.date.format('YYYY-MM-DD')
          dateWithoutTimezone += 'T00:00:00.000Z'
          entry.date = moment(dateWithoutTimezone)
        }

        // cozy-db will cast the moment instance into a date since
        // moment.valueOf returns a timestamp that new Date() will parse
        return model.create(entry, function (err) {
          if (err) {
            log.raw(err)
            log.error(`entry for ${entryLabel} not saved.`)
          } else {
            log.info(`entry for ${entryLabel} saved.`)
          }
          return callback()
        })
      }

      log.info(`import for entry ${entryLabel} started.`)
      if (entry.pdfurl != null) {
        // It creates a file for the PDF.
        return createFileAndSaveData(entry, entryLabel)
      } else {
        // If there is no file link set, it saves only data.
        log.info(`No file to download for ${entryLabel}.`)
        return saveEntry(entry, entryLabel)
      }
    }, function (err) {
      if (err) {
        log.error(err)
        return next()
      }

      const opts = {
        entries: entries.fetched,
        folderPath: normalizedPath,
        nameOptions: options,
        tags,
        model,
        log
      }
      return checkForMissingFiles(opts, () => next())
    })
  }
}

// For each entry, ensure that the corresponding file exists in the Cozy Files
// application. If it doesn't exist, it creates the file by downloading it
// from its url.
var checkForMissingFiles = function (options, callback) {
  // ignore file operations at the moment
  return callback()
  // const {entries, folderPath, nameOptions, tags, model, log} = options

  // return async.eachSeries(entries, function (entry, done) {
  //   const fileName = naming.getEntryFileName(entry, nameOptions)
  //   let path = `${folderPath}/${fileName}`

  //   // Check if the file is there.
  //   return File.isPresent(path, function (err, isPresent) {
  //     if (err) {
  //       log.error(err)
  //       return done()
  //     }
  //     // If it's there, it does nothing.
  //     if (isPresent || (entry.pdfurl == null)) { return done() }

  //     // If it's not there, it creates it.
  //     const url = entry.pdfurl
  //     path = folderPath

  //     return Folder.mkdirp(path, () =>
  //         File.createNew(fileName, path, url, tags, function (err, file) {
  //           if (err) {
  //             log.error('An error occured while creating file')
  //             return log.raw(err)
  //           } else {
  //             // Then update links it from the current model to
  //             // the file.
  //             let date = `${entry.date.format('YYYY-MM-DD')}T00:00:00.000Z`
  //             date = moment(date)

  //             return model.request('byDate', {key: date}, function (err, entries) {
  //               if (err) {
  //                 log.error(err)
  //                 return done()
  //               }
  //               if ((entries == null) || (entries.length === 0)) {
  //                 return done()
  //               } else {
  //                 entry = entries[0]
  //                 const data = {
  //                   fileId: file.id,
  //                   binaryId: file.binary.file.id
  //                 }
  //                 return entry.updateAttributes(data, function (err) {
  //                   if (err) {
  //                     log.error(err)
  //                     return done()
  //                   }
  //                   const fullPath = `${path}/${file.name}`
  //                   log.info(`Missing file created: ${fullPath}`)

  //                   return done()
  //                 })
  //               }
  //             })
  //           }
  //         })
  //     )
  //   })
  // }, err => {
  //   if (err) {
  //     log.error(err)
  //   }
  //   return callback()
  // })
}
