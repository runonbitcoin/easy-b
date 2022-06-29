const { MAINNET } = require('../network')
const { BFile } = require('../b-file')
const Run = require('run-sdk')
const nimble = require('@runonbitcoin/nimble')

const read = async (txid, network = MAINNET) => {
  const run = Run.instance || new Run({ network: network.forRun() })
  const response = await run.blockchain.fetch(txid)

  const txBuff = Buffer.from(response, 'hex')

  const tx = nimble.functions.decodeTx(txBuff)

  const bOutput = tx.outputs.find(o => {
    const chunks = nimble.functions.decodeScriptChunks(o.script)
    return Buffer.from(chunks[2].buf).equals(Buffer.from('19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut'))
  })

  const chunks = nimble.functions.decodeScriptChunks(bOutput.script)

  return new BFile(
    chunks[3].buf,
    chunks[4].buf.toString(),
    chunks[5] ? chunks[5].buf.toString() : null,
    chunks[6] ? chunks[6].buf.toString() : null
  )
}

module.exports = { read }
