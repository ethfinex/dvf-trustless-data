/* eslint-env mocha */
const {assert} = require('chai')
const moment = require('moment')

const nockBack = require('nock').back
nockBack.fixtures = './tests/fixtures/'
nockBack.setMode('record')

const mongoose = require('mongoose')
const connectMongoose = require('../src/models/mongoose')

const Block = require('../src/models/Block')
const Transaction = require('../src/models/Transaction')
const Event = require('../src/models/Event')

const getEfxConfig = require('../src/lib/efx/getConfig')
const getHourlyCandle = require('../src/lib/bfx/getHourlyCandle')

const getBlock = require('../src/lib/web3/getBlock')
const getFillLogs = require('../src/lib/0x/getFillLogs')
const saveFillLogs = require('../src/lib/efx/saveFillLogs')


const calculateTokenRanking = require('../src/models/methods/calculateTokenRanking')
const calculateVolume = require('../src/models/methods/calculateVolume')

nockBack( 'all-tests.json', nockDone => {

  let httpServer = null

  before( async () => {
    await connectMongoose(process.env.MONGODB_URI)

    await mongoose.connection.db.dropDatabase()
  })

  after( () => nockDone() )

  describe('~ bfx-data', async () => {
    it('get candle for 1564620468 timestamp', async () => {
      // 1564620468 is timestamp for: 2019-08-01 00:47:48.000Z
      const candle = await getHourlyCandle('ETH', 1564620468)

      assert.equal(candle.length, 6)
      assert.notOk(candle.cached)

    })

    it('get cached candle for 1564620478 timestamp', async () => {
      // 1564620468 is timestamp for: 2019-08-01 00:2:58.000Z
      const candle = await getHourlyCandle('ETH', 1564620178)

      assert.equal(candle.length, 6)
      assert.equal(candle.cached, true)
    })

    it('get candle for 1564820178 timestamp', async () => {
      // 1564820178 is timestamp for: 2019-08-03 08:16:18.000Z
      const candle = await getHourlyCandle('ETH', 1564820178)

      assert.equal(candle.length, 6)
      assert.notOk(candle.cached)

    })

  })

  describe('~ trustless-data', async () => {

    it('config is being fetched from ethfinex api', async () => {

      const config = await getEfxConfig()

      // assert tokenRegistry contains tokens
      assert.ok(Object.keys(config.tokenRegistry))
      assert.equal(config.protocol, "0x")
      assert.equal(config.ethfinexAddress, "0x61b9898c9b60a159fc91ae8026563cd226b7a0c1")
    })

    it('grab current block', async () => {
      const lastBlock = await getBlock()

      assert.ok(lastBlock.number)
    })

    it('grab logs and save them to the database', async () => {
      const lastBlock = await getBlock()

      const range = {
        fromBlock: {
          number: 8232529, // roughly 8 hours
        },
        toBlock: {
          number: 8233529,
        },
      }

      const logs = await getFillLogs(range)

      saved = await saveFillLogs(logs)

      // console.log(`length -> ${Object.keys(logs).length}`)
      // current fixture have 123 blocks with transactions
      assert.equal(saved.blocks.length, await Block.countDocuments())
      assert.equal(saved.transactions.length, await Transaction.countDocuments())
      assert.equal(saved.events.length, await Event.countDocuments())
    })

    it('calculate token ranking', async () => {
      const ranking = await calculateTokenRanking('ETH')

      assert.equal(ranking.length, 2)
      assert.equal(ranking[0].address, '0x8553d50f35f20c4541960bffb19c2b0a6174e6fc')
      assert.equal(ranking[0].amount, 74.507208255)

      assert.equal(ranking[1].address, '0xf63246f4df508eba748df25daa8bd96816a668ba')
      assert.equal(ranking[1].amount, 0.9186519439482634)
    })

    // TODO: write a test for a query with startDate and endDate
    it('calculate token ranking for a given date period', async () => {
      const startDate = 1564234294 // 2019-07-27 13:31:34.000Z
      const endDate = 1564234295   // 2019-07-27 13:31:35.000Z

      const ranking = await calculateTokenRanking('ETH', startDate, endDate)

      console.log('ranking ', ranking)
      assert.equal(ranking[0].address, '0xf63246f4df508eba748df25daa8bd96816a668ba')
      assert.equal(ranking[0].amount, 0.050125313283260954)
    })

    it('calculate volume for a given date period', async () => {
      const startDate = 1564234294 // 2019-07-27 13:31:34.000Z
      const endDate = 1564234295   // 2019-07-27 13:31:35.000Z

      const volume = await calculateVolume(startDate, endDate)

      console.log('volume ', volume)
      assert.equal(volume[0].totalUSDValue, 0.050125313283260954')
    })

  })



})
