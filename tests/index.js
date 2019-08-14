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
const getPrice = require('../src/lib/bfx/getPrice')

const getBlock = require('../src/lib/web3/getBlock')
const getFillLogs = require('../src/lib/0x/getFillLogs')
const saveFillLogs = require('../src/lib/efx/saveFillLogs')


const calculateTokenRanking = require('../src/models/methods/calculateTokenRanking')
const calculateUSDRanking = require('../src/models/methods/calculateUSDRanking')
const calculateVolume = require('../src/models/methods/calculateVolume')
const calculateVolumeForAddress = require('../src/models/methods/calculateVolumeForAddress')

// TODO: Add tests for all api endpoints

nockBack( 'all-tests.json', nockDone => {

  let httpServer = null

  before( async () => {
    await connectMongoose(process.env.MONGODB_URI)

    await mongoose.connection.db.dropDatabase()
  })

  after( () => nockDone() )

  describe('~ bfx-data', async () => {

    it('getHourlyCandle: fetch candle', async () => {
      // 1564620468 is timestamp for: 2019-08-01 00:47:48.000Z
      const candle = await getHourlyCandle('ETH', 1564620468)

      assert.equal(candle.length, 6)
      assert.notOk(candle.cached)

    })

    it('getHourlyCandle: fetch cached candle', async () => {
      // 1564620178 is timestamp for: 2019-08-01 00:42:58.000Z
      const candle = await getHourlyCandle('ETH', 1564620178)

      assert.equal(candle.length, 6)
      assert.equal(candle.cached, true)
    })

    it('getPrice: fetch open price for given timestamp', async () => {
      // 1564820178 is timestamp for: 2019-08-03 08:16:18.000Z
      const price = await getPrice('ETH', 1564820178)

      assert.equal(price, 222.21)
    })

  })

  describe('~ trustless-data', async () => {

    it('getEFXConfig: config is being fetched from ethfinex api', async () => {

      const config = await getEfxConfig()

      // assert tokenRegistry contains tokens
      assert.ok(Object.keys(config.tokenRegistry))
      assert.equal(config.protocol, "0x")
      assert.equal(config.ethfinexAddress, "0x61b9898c9b60a159fc91ae8026563cd226b7a0c1")
    })

    it('getBlock: return a valid block', async () => {
      const lastBlock = await getBlock()

      assert.ok(lastBlock.number)
    })

    it('getFillLogs / saveFillLogs: Download blocks and save to database', async () => {
      const lastBlock = await getBlock()

      const range = {
        fromBlock: {
          number: 8232529,
        },
        toBlock: {
          number: 8233529,
        },
      }

      const logs = await getFillLogs(range)

      saved = await saveFillLogs(logs)

      assert.equal(saved.blocks.length, await Block.countDocuments())
      assert.equal(saved.transactions.length, await Transaction.countDocuments())
      assert.equal(saved.events.length, await Event.countDocuments())
    })

    it('calculateTokenRanking: returns calculated token ranking', async () => {
      const ranking = await calculateTokenRanking('ETH')

      assert.equal(ranking.length, 2)
      assert.equal(ranking[0].address, '0x8553d50f35f20c4541960bffb19c2b0a6174e6fc')
      assert.equal(ranking[0].amount, 74.507208255)

      assert.equal(ranking[1].address, '0xf63246f4df508eba748df25daa8bd96816a668ba')
      assert.equal(ranking[1].amount, 0.9186519439482634)
    })

    it('calculateUSDRanking: returns overall ranking for all currencies', async () => {
      const ranking = await calculateUSDRanking()

      assert.equal(ranking.length, 4)
      assert.equal(ranking[0].address, '0x8553d50f35f20c4541960bffb19c2b0a6174e6fc')
      assert.equal(ranking[0].USDValue, 15355.042811)

      assert.equal(ranking[1].address, '0xc6093fd9cc143f9f058938868b2df2daf9a91d28')
      assert.equal(ranking[1].USDValue, 534.9980052953249)

      assert.equal(ranking[2].address, '0xf63246f4df508eba748df25daa8bd96816a668ba')
      assert.equal(ranking[2].USDValue, 201.38879224688242)

      assert.equal(ranking[3].address, '0x96e50ccd13ebf0791d4d8f1cac0c66b8671c8e1b')
      assert.equal(ranking[3].USDValue, 44.118284)
    })


    it('calculateTokenRanking: returns ranking for a given date period', async () => {
      const startDate = 1564234294 // 2019-07-27 13:31:34.000Z
      const endDate = 1564234295   // 2019-07-27 13:31:35.000Z

      const ranking = await calculateTokenRanking('ETH', startDate, endDate)

      assert.equal(ranking[0].address, '0xf63246f4df508eba748df25daa8bd96816a668ba')
      assert.equal(ranking[0].amount, 0.050125313283260954)
    })

    it('calculateVolume: returns for a given date period', async () => {
      const startDate = 1564234294 // 2019-07-27 13:31:34.000Z
      const endDate = 1564234295   // 2019-07-27 13:31:35.000Z

      const volume = await calculateVolume(startDate, endDate)

      assert.equal(volume.TotalUSDValue, 20.895429362902952)
      // Check sum of all token USD value sums to total
      const totalUSDSum = Object.keys(volume.tokens).reduce(function (total, key) {
        return total + volume.tokens[key].USDValue;
      }, 0);
      assert.equal(volume.TotalUSDValue, totalUSDSum)

    })

    it('calculateVolumeForAddress: returns for a given address over a given date period', async () => {
      const startDate = 1564185600 // 2019-07-27 00:00:00.000Z
      const endDate = 1564358400   // 2019-07-29 00:00:00.000Z

      const volume = await calculateVolumeForAddress('0xf63246f4df508eba748df25daa8bd96816a668ba', startDate, endDate)

      assert.equal(volume.TotalUSDValue, 201.38879224688242)
      // Check sum of all token USD value sums to total
      const totalUSDSum = Object.keys(volume.tokens).reduce(function (total, key) {
        return total + volume.tokens[key].USDValue;
      }, 0);
      assert.equal(volume.TotalUSDValue, totalUSDSum)
    })

    it('calculateVolume: correctly handles bad date range', async () => {
      const startDate = 1564358
      const endDate = 1564185

      const volume = await calculateVolume(startDate, endDate)
      assert.equal(volume.TotalUSDValue, 0, 'End date before start date badly handled')
      assert.deepEqual(volume.tokens, {}, 'End date before start date badly handled')
    })

  })

})
