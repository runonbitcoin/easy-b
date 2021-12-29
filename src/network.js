const { Networks } = require('bsv')

class Network {
  constructor (short, long, bsvObject) {
    this.short = short
    this.long = long
    this.bsvObject = bsvObject
  }

  forRun () {
    return this.short
  }

  static fromString (str) {
    const found = [MAINNET, TESTNET].find(network => network.short === str || network.long === str)
    if (!found) {
      throw new Error(`unknown network ${str}`)
    }
    return found
  }
}

const MAINNET = new Network(
  'main',
  'mainnet',
  Networks.mainnet
)

const TESTNET = new Network(
  'test',
  'testnet',
  Networks.testnet
)

module.exports = {
  Network,
  MAINNET,
  TESTNET
}
