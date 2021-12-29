const commands = require('./commands')
const { BFile } = require('./b-file')

module.exports = {
  ...commands,
  BFile
}