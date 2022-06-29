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

  describe('when there is enough funds', () => {
    beforeEach(async () => {
      const address = get.purseKey.toAddress()
      await get.run.blockchain.fund(address.toString(), 1e8)
    })

    it('can publish a simple file', async () => {
      const file = new BFile(Buffer.from('holu'), 'text/plain')
      const txid = await publish(file, TESTNET, get.purseWif)

      const hexTx = await get.run.blockchain.fetch(txid)
      expect(() => nimble.functions.decodeTx(Buffer.from(hexTx, 'hex'))).not.to.throw()
    })

    it('creates a change output', async () => {
      const file = new BFile(Buffer.from('holu'), 'text/plain')
      const txid = await publish(file, TESTNET, get.purseWif)

      const hexTx = await get.run.blockchain.fetch(txid)
      const tx = nimble.functions.decodeTx(Buffer.from(hexTx, 'hex'))
      expect(tx.outputs).to.have.length(2)
      const output = tx.outputs.find(o => Buffer.from(get.purseKey.toAddress().toScript().toBuffer()).equals(Buffer.from(o.script)))
      expect(output).to.be.an('object')
    })

    it('can publish a 10mb file', async function () {
      this.timeout(1000 * 60)
      const file = new BFile(Buffer.alloc((2 ** 20) * 10).fill('a'), 'text/plain')
      try {
        await publish(file, TESTNET, get.purseWif)
      } catch (e) {
        // because we are using the mockchain we get this error. This will be fixed in run 0.7
        // with the mockchain using nimble. This doesn't happens with real blockchain
        expect(e.message).to.eql('transaction over the maximum block size')
      }
    })
  })
})
