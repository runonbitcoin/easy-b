const fs = require('fs')
const signale = require('signale')
const { Transaction, PrivateKey, Address, Script, Networks } = require('bsv')
const Run = require('run-sdk')

const path = require('path')
const { detectMimeType } = require('./detect-mime-type')
const { BFile } = require('./b-file')

const publish = async (file, network, purseWif) => {
  let runNetwork
  if (network === Networks.mainnet) {
    runNetwork = 'main'
  } else if (network === Networks.testnet) {
    runNetwork = 'test'
  } else {
    throw new Error(`Unknown network: ${network}`)
  }

  const run = new Run({ network: runNetwork })
  const blockchain = run.blockchain

  // Load file
  const filePath = file

  // open file
  let fileBuffer
  try {
    fileBuffer = fs.readFileSync(filePath)
  } catch (e) {
    signale.fatal(`Cannot open specified route: ${filePath}`)
    process.exit(1)
  }
  const fileName = path.basename(filePath)
  const mime = await detectMimeType(fileBuffer)
  signale.watch(`File resolved. Name: ${fileName} Mime type: ${mime}`)

  // Get fund key
  const privKey = new PrivateKey(purseWif, network)
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
  const bFile = new BFile(fileBuffer, mime, 'binary', fileName)
  tx.addOutput(bFile.toTxOutput())

  // Build and sign tx.
  tx.sign([privKey])
  signale.watch('Tx built and signed.')

  // Broadcast
  try {
    await blockchain.broadcast(tx.checkedSerialize())
  } catch (e) {
    signale.error(`Error: ${e.message}`)
    process.exit(1)
  }
  signale.success(`Success: ${tx.hash}`)
}

module.exports = { publish }
