const { Transaction, PrivateKey, Address, Script } = require('bsv')
const Run = require('run-sdk')
const { NullLogger } = require('../logging/null-logger')
const fetch = require('node-fetch')

async function broadcast (tx, network) {
  const response = await fetch(`https://api.run.network/v1/${network.short}/tx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rawtx: tx.uncheckedSerialize()
    })
  })
  if (!response.ok) {
    const body = await response.json()
    console.log(Object.keys(body))
    console.log(body.message)
    throw new Error('Problem broadcasting transaction.')
  }
}

const publish = async (bFile, network, purseWif, logger = new NullLogger()) => {
  const run = new Run({ network: network.forRun() })
  const blockchain = run.blockchain

  // Get fund key
  const privKey = new PrivateKey(purseWif, network.long)
  // const keyPair = KeyPair.fromPrivKey(privKey)
  const inputAddress = Address.fromPrivateKey(privKey)

  // new tx
  const tx = new Transaction()
  tx.feePerKb(250)

  // Build tx consumming utxos for current key
  const utxos = await blockchain.utxos(inputAddress.toString())

  for (const utxo of utxos) {
    tx.from({
      txid: utxo.txid,
      vout: utxo.vout,
      script: Script.fromHex(utxo.script),
      satoshis: utxo.satoshis
    })
  }

  // Send change to the same key.
  tx.change(inputAddress)

  // Add B data.
  tx.addOutput(bFile.toTxOutput())

  // Build and sign tx.
  tx.sign([privKey])
  logger.info('Tx built and signed.')

  // Broadcast
  try {
    await broadcast(tx, network)
  } catch (e) {
    logger.fatal(`Error: ${e.message}`)
    process.exit(1)
  }
  return tx.hash
}

module.exports = { publish }
