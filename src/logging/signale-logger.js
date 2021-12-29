const signale = require('signale')

class SignaleLogger {
  info (msg) {
    signale.watch(msg)
  }

  success (msg) {
    signale.success(msg)
  }

  fatal (msg) {
    signale.fatal(msg)
  }
}

module.exports = { SignaleLogger }
