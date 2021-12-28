const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { PrivateKey, Networks } = require('bsv')
const { publish } = require('../src/publish')

const cli = yargs(hideBin(process.argv))

// Optional, define network
cli.option('network', {
  type: 'string',
  default: process.env.BSV_NETWORK || 'main',
  desc: 'bsv network. Defaults to env var BSV_NETWORK. If absent defaults to mainnet',
  coerce: (input) => {
    if (input === 'main' || input === 'mainnet') {
      return Networks.mainnet
    } else if (input === 'test' || input === 'testnet') {
      return Networks.testnet
    } else {
      throw new Error(`Unknown network: ${input}`)
    }
  }
})

// Optional, define purse wif
cli.option('purse-wif', {
  alias: 'purse',
  desc: 'Private key to fund transactions. Defaults to env var PURSE_WIF',
  type: 'string',
  default: process.env.PURSE_WIF
})
cli.check((argv) => {
  try {
    new PrivateKey(argv.purse, argv.network)
    return true
  } catch (e) {
    throw e
  }
  return true
})


// Command: publish

cli.command(
  'publish <file>',
  'publish a file using B protocol',
  (yargs) => {
    return yargs
      .positional('file', {
        describe: 'file to upload to the blockchain'
      })
  },
  (yargs) => {
    publish(yargs.file, yargs.network, yargs.purse)
  })


// Common configurations and execute
cli.showHelpOnFail(true)
  .demandCommand()
  .parse()
