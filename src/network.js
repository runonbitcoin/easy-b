class Network {
  constructor (short, long, nimbleIsTestnet) {
    this.short = short
    this.long = long
    this.nimbleIsTestnet = nimbleIsTestnet
  }

  forRun () {
    return this.short
  }

  isTestnet () {
    return this.nimbleIsTestnet
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
  false
)

const TESTNET = new Network(
  'test',
  'testnet',
  true
)

module.exports = {
  Network,
  MAINNET,
  TESTNET
}
