const { BFile, publish, read } = require('../src')
const { TESTNET } = require('../src/network')
const { PrivateKey } = require('@runonbitcoin/nimble')
const { def, get } = require('bdd-lazy-var/getter')
const Run = require('run-sdk')
const { expect } = require('chai')
const { describe, it, beforeEach } = require('mocha')

describe('publish', function () {
  def('purseKey', () => PrivateKey.fromRandom(TESTNET.forRun()))
  def('purseWif', () =>
    get.purseKey.toString()
  )
  def('run', () => {
    const blockchain = new Run.plugins.Mockchain({ feePerKb: 50 })
    return new Run({ network: 'mock', blockchain })
  })

  def('bTxid', async () => {
    const address = get.purseKey.toAddress()
    await get.run.blockchain.fund(address.toString(), 1e8)
    const file = new BFile(Buffer.from('holu'), 'text/plain', 'binary', 'sometext.txt')
    return publish(file, TESTNET, get.purseWif)
  })

  beforeEach(async () => {
    await get.bTxid
  })

  it('can read a file that exists', async () => {
    const bFile = await read(await get.bTxid, TESTNET)
    expect(bFile.mime).to.eql('text/plain')
    expect(bFile.fileName).to.eql('sometext.txt')
    expect(bFile.format).to.eql('binary')
    expect(bFile.buff.equals(Buffer.from('holu'))).to.eql(true)
  })
})
