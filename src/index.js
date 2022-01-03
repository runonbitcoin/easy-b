const commands = require('./commands')
const { BFile } = require('./b-file')
const networks = require('./network')

module.exports = {
  ...commands,
  BFile,
  networks
}