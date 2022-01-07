const { Transaction } = require('bsv')
const { MAINNET } = require('../network')
const fetch = require('node-fetch')
const { BFile } = require('../b-file')

const read = async (txid, network = MAINNET) => {
  const response = await fetch(`https://api.run.network/v1/${network.short}/rawtx/${txid}`)
  if (!response.ok) {
    throw new Error(`Error fetching tx: ${txid}`)
  }
  const txBuff = await response.buffer()

  const tx = new Transaction(txBuff)

  const bOutput = tx.outputs.find(o => {
    return o.script && o.script.chunks[2] &&
      Buffer.from('19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut').equals(o.script.chunks[2].buf)
  })

  return new BFile(
    bOutput.script.chunks[3].buf,
    bOutput.script.chunks[4].buf.toString(),
    bOutput.script.chunks[5].buf.toString(),
    bOutput.script.chunks[6].buf.toString()
  )
}

module.exports = { read }
