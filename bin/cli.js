const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { Networks, PrivateKey } = require('bsv')
const { publish } = require('../src/publish')
const { read } = require('../src/read')
const fs = require('fs')
const signale = require('signale')
const path = require('path')
const { Network } = require('../src/network')

const cli = yargs(hideBin(process.argv))

// Optional, define network
cli.option('network', {
  type: 'string',
  default: process.env.BSV_NETWORK || 'main',
  desc: 'bsv network. Defaults to env var BSV_NETWORK. If absent defaults to mainnet',
  coerce: (input) => {
    console.log('input', input)
    return Network.fromString(input)
  }
})

// Optional, define purse wif
cli.option('purse-wif', {
  alias: 'purse',
  desc: 'Private key to fund transactions. Defaults to env var PURSE_WIF',
  type: 'string',
  default: process.env.PURSE_WIF
})
cli.check((yargs) => {
  if (yargs.purse) {
    const privKey = new PrivateKey(yargs.purse)
    if (privKey.network !== yargs.network.bsvObject) {
      throw new Error(`Specified network (${yargs.network.long}) does not match with purse network (${privKey.network.alias})`)
    }
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
      .check((yargs) => {
        if (!yargs.purse) {
          throw new Error(`Please specify a purse private key`)
        }
        return true
      })
  },
  async (yargs) => {
    await publish(yargs.file, yargs.network, yargs.purse)
  })

// Command: read
cli.command(
  'read <txid>',
  'read a file published using B and print it to stdout',
  (yargs) => {
    return yargs
      .positional('txid', {
        desc: 'txid where to search for the B file.'
      })
      .option('output', {
        alias: 'o',
        desc: 'Output location. If not specified print to stdout. If output is a folder tries to use original filename',
        type: 'string',
        default: null,
        normalize: true
      })
  },
  async (yargs) => {
    const bFile = await read(yargs.txid, yargs.network)
    const output = yargs.output
    console.log('output', output)
    if (output) {
      const stat = fs.statSync(output)
      if (stat.isDirectory()) {
        const newPath = path.basename(
          path.join(output, bFile.fileName)
        )
        fs.writeFileSync(newPath, bFile.buff)
      } else {
        fs.writeFileSync(output, bFile.buff)
      }
      signale.success('Ok!')
    } else {
      process.stdout.write(bFile.buff)
    }
  })

// Common configurations and execute
cli.showHelpOnFail(true)
  .demandCommand()
  .parse()
