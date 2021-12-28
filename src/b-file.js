const { Transaction, Script } = require('bsv')

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
}

module.exports = { BFile }