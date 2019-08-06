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

      // TODO: test more conditions to validate if config is being fetched
      // correctly
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
          number: 8261329,
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

      assert.equal(ranking.length, 22)
      assert.equal(ranking[16].address, '0xd1480f6e2da2f39ea4323d93c0af0db5979227a2')
      assert.equal(ranking[16].amount, 2.0464377233173687)
    })

    // TODO: write a test for a query with startDate and endDate
    it('calculate token ranking for a given date', async () => {
      const startDate = 1564620468 // 2019-08-01 00:47:48.000Z
      const endDate = 1564620469   // 2019-08-01 00:47:49.000Z

      const ranking = await calculateTokenRanking('ETH', startDate, endDate)

      assert.equal(ranking.length, 1)
      assert.equal(ranking[0].address, '0xf63246f4df508eba748df25daa8bd96816a668ba')
      assert.equal(ranking[0].amount, 0.9186519439482634)
    })

  })



})
