const Run = require('run-sdk')
const { NullLogger } = require('../logging/null-logger')
const nimble = require('@runonbitcoin/nimble')
const { PrivateKey } = nimble
const { forgeTx, toUTXO, casts } = require('txforge')
const { P2PKH, OpReturn } = casts
const fetch = require('node-fetch')

const defaultBroadcast = async (hexTx, network) => {
  const response = await fetch(`https://api.run.network/v1/${network.forRun()}/tx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rawtx: hexTx
    })
  })

  if (!response.ok) {
    let json
    try {
      json = await response.json()
    } catch (e) {
      throw new Error(`problem broadcasting tx: ${response.status}`)
    }
    throw new Error(`problem broadcasting tx: ${json.message}`)
  }

  return await response.text()
}

const publish = async (bFile, network, purseWif, opts = {}) => {
  const logger = opts.logger || new NullLogger()
  const feePerKb = opts.feePerKb || 50
  const broadcast = opts.broadcast || defaultBroadcast

  const run = Run.instance || new Run({ network: network.forRun() })
  const blockchain = run.blockchain

  // Get fund key
  const privKey = PrivateKey.fromString(purseWif)
  const inputAddress = privKey.toAddress()

  // ask for utxos
  const utxos = await blockchain.utxos(inputAddress.toString())

  const tx = forgeTx({
    inputs: utxos.map(utxo => P2PKH.unlock(toUTXO(utxo), { privkey: privKey })),
    outputs: [
      OpReturn.lock(0, { data: bFile.toBChunks() })
    ],
    change: { address: inputAddress },
    options: {
      rates: { data: feePerKb, standard: feePerKb }
    }
  })

  // Broadcast
  try {
    await broadcast(tx.verify().toHex(), network)
  } catch (e) {
    logger.fatal(`Error: ${e.message}`)
    throw e
  }

  return tx.hash
}

module.exports = { publish }
