const { BFile, publish } = require('../src')
const { TESTNET } = require('../src/network')
const nimble = require('@runonbitcoin/nimble')
const { def, get } = require('bdd-lazy-var/getter')
const Run = require('run-sdk')
const { expect } = require('chai')
const { describe, it, beforeEach } = require('mocha')

const { PrivateKey } = nimble.classes

describe('publish', function () {
  def('purseKey', () => PrivateKey.fromRandom(TESTNET.forRun()))
  def('purseWif', () =>
    get.purseKey.toString()
  )
  def('run', () => {
    const blockchain = new Run.plugins.Mockchain({ feePerKb: 50 })
    return new Run({ network: 'mock', blockchain })
  })

  def('broadcast', () => (txHex) => {
    return get.run.blockchain.broadcast(txHex)
  })

  describe('when there is enough funds', () => {
    beforeEach(async () => {
      const address = get.purseKey.toAddress()
      await get.run.blockchain.fund(address.toString(), 1e8)
    })

    it('can publish a simple file', async () => {
      const file = new BFile(Buffer.from('holu'), 'text/plain')
      const txid = await publish(file, TESTNET, get.purseWif, { broadcast: get.broadcast })

      const hexTx = await get.run.blockchain.fetch(txid)
      expect(() => nimble.functions.decodeTx(Buffer.from(hexTx, 'hex'))).not.to.throw()
    })

    it('sets right fee', async () => {
      const file = new BFile(Buffer.from('holu'), 'text/plain')
      const feePerKb = 554 // arbitrary amount
      const txid = await publish(file, TESTNET, get.purseWif, { feePerKb: feePerKb, broadcast: get.broadcast })

      const hexTx = await get.run.blockchain.fetch(txid)
      const tx = nimble.classes.Transaction.fromHex(hexTx)
      const estimated = 1e8 - Math.ceil((tx.toBuffer().byteLength / 1000) * feePerKb)
      expect(tx.outputs[1].satoshis).to.be.within(estimated - 10, estimated + 10)
    })

    it('sets 50 sats/kb by default', async () => {
      const file = new BFile(Buffer.from('holu'), 'text/plain')
      const feePerKb = 50 // arbitrary amount
      const txid = await publish(file, TESTNET, get.purseWif, { broadcast: get.broadcast })

      const hexTx = await get.run.blockchain.fetch(txid)
      const tx = nimble.classes.Transaction.fromHex(hexTx)
      const estimated = 1e8 - Math.ceil((tx.toBuffer().byteLength / 1000) * feePerKb)
      expect(tx.outputs[1].satoshis).to.be.within(estimated - 10, estimated + 10)
    })

    it('creates a change output', async () => {
      const file = new BFile(Buffer.from('holu'), 'text/plain')
      const txid = await publish(file, TESTNET, get.purseWif, { broadcast: get.broadcast })

      const hexTx = await get.run.blockchain.fetch(txid)
      const tx = nimble.functions.decodeTx(Buffer.from(hexTx, 'hex'))
      expect(tx.outputs).to.have.length(2)
      const output = tx.outputs.find(o => Buffer.from(get.purseKey.toAddress().toScript().toBuffer()).equals(Buffer.from(o.script)))
      expect(output).to.be.an('object')
    })

    it('can publish a 2mb file', async function () {
      this.timeout(1000 * 60)
      const file = new BFile(Buffer.alloc((2 ** 20) * 2).fill('a'), 'text/plain')

      let broadcasted = false
      await publish(file, TESTNET, get.purseWif, {
        broadcast: async (txHex) => {
          broadcasted = true
          const tx = nimble.classes.Transaction.fromBuffer(Buffer.from(txHex, 'hex'))
          expect(Buffer.from(tx.outputs[0].script.chunks[3].buf).equals(file.buff))
          return tx.hash
        }
      })

      expect(broadcasted).to.eql(true)
    })
  })
})
