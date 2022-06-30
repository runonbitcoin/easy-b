const Run = require('run-sdk')
const { NullLogger } = require('../logging/null-logger')
const nimble = require('@runonbitcoin/nimble')
const { PrivateKey } = nimble
const { forgeTx, toUTXO, casts } = require('txforge')
const { P2PKH, OpReturn } = casts

const publish = async (bFile, network, purseWif, opts = {}) => {
  const logger = opts.logger || new NullLogger()
  const feePerKb = opts.feePerKb || 50

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
    await run.blockchain.broadcast(tx.verify().toHex())
  } catch (e) {
    logger.fatal(`Error: ${e.message}`)
    throw e
  }

  return tx.hash
}

module.exports = { publish }
