const { Transaction, Script } = require('bsv')
const fs = require('fs')
const path = require('path')
const { detectMimeType } = require('./detect-mime-type')
const { NullLogger } = require('./logging/null-logger')

class BFile {
  constructor (buffer, mime, format = 'binary', fileName = '') {
    this.buff = buffer
    this.mime = mime
    this.format = format
    this.fileName = fileName
  }

  toTxOutput () {
    return new Transaction.Output({
      satoshis: 0,
      script: Script.buildSafeDataOut([
        Buffer.from('19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut'),
        this.buff,
        Buffer.from(this.mime),
        Buffer.from(this.format),
        Buffer.from(this.fileName)
      ])
    })
  }

  static async fromFilePath (filePath, logger = new NullLogger()) {
    let fileBuffer
    try {
      fileBuffer = fs.readFileSync(filePath)
    } catch (e) {
      logger.fatal(`Cannot open specified route: ${filePath}`)
      process.exit(1)
    }
    const fileName = path.basename(filePath)
    const mime = await detectMimeType(fileBuffer)
    logger.info(`File resolved. Name: ${fileName} Mime type: ${mime}`)
    return new this(fileBuffer, mime, 'binary', fileName)
  }
}

module.exports = { BFile }
