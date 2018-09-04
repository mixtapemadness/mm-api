/* eslint handle-callback-err:0 */
'use strict'

const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { map: mapAsync } = require('bluebird')
const shortid = require('shortid')
const config = require('app/config')
const gm = require('gm')

mkdirp.sync(config.upload.dir)

class FileRepository {
  constructor ({ db }) {
    this.db = db
  }

  upload ({ user, files }) {
    return mapAsync(
      files,
      fileUpload =>
        (
          fileUpload.then
            ? fileUpload
            : Promise.resolve(fileUpload)
        )
          .then(file =>
            this
              .uploadFile(
                Object.assign(file, { userId: user._id })
              )
          ),
      { concurrency: 1 }
    )
  }

  uploadFile ({ userId, stream, filename: original, mimetype, encoding }) {
    const { FileModel } = this.db

    const ext = path.parse(original).ext
    const filename = `${userId}-${shortid.generate()}${ext}`
    const filepath = path.join(config.upload.dir, filename)

    return this
      .storeFile({ stream, filepath })
      .then(() => {
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          gm(filepath)
            .resize('800>')
            .noProfile()
            .autoOrient()
            .quality(90) // quality range 0 - 100
            .write(path.join(config.upload.dir, filename), function (err) {
              if (err) return Promise.reject(err)
              return Promise.resolve(filepath)
            })
        } else {
          Promise.resolve(filepath)
        }
      })
      .then(() =>
        new FileModel({
          filename,
          mimetype,
          encoding,
          creator: userId
        }).save()
      )
  }

  storeFile ({ stream, filepath, original }) {
    return new Promise((resolve, reject) =>
      stream
        .on('error', error => {
          if (stream.truncated) {
            // Delete the truncated file
            fs.unlinkSync(original)
          }
          reject(error)
        })
        .pipe(fs.createWriteStream(filepath))
        .on('error', error => reject(error))
        .on('finish', () => resolve({}))
    )
  }

  async removeFile ({ filename }) {
    const fileRecord = await this.db.FileModel.findOneAndRemove({ filename })

    if (fileRecord) {
      const filepath = path.join(config.upload.dir, fileRecord.filename)
      fs.unlinkSync(filepath)
    }
  }
}

module.exports = FileRepository

