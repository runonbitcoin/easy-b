const { Magic, MAGIC_MIME_TYPE } = require('mmmagic')

const detectMimeType = async (buffer) => {
  const magic = new Magic(MAGIC_MIME_TYPE)
  return new Promise((resolve, reject) => {
    magic.detect(buffer, (err, result) => {
      if (err) {
        return reject(err)
      }
      return resolve(result)
    })
  })
}

module.exports = { detectMimeType }
