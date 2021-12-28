const { Networks, Transaction } = require('bsv')
const fetch = require('node-fetch')
const { BFile } = require('./b-file')

const read = async (txid, vout, network = Networks.mainnet) => {
  let networkPrefix
  if (network === Networks.mainnet) {
    networkPrefix = 'main'
  } else if (network === Networks.testnet) {
    networkPrefix = 'test'
  }

  const response = await fetch(`https://api.run.network/v1/${networkPrefix}/rawtx/${txid}`)
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
    bOutput.script.chunks[4].buf,
    bOutput.script.chunks[5].buf,
    bOutput.script.chunks[6].buf
  )
}

module.exports = { read }
