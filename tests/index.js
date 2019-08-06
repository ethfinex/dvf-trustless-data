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

const Web3 = require('web3')
const getEfxConfig = require('../src/lib/efx/getConfig.js')

const getBlock = require('../src/lib/web3/getBlock')
const getFillLogs = require('../src/lib/0x/getFillLogs')
const saveFillLogs = require('../src/lib/0x/saveFillLogs')


const calculateTokenRanking = require('../src/models/methods/calculateTokenRanking')

nockBack( 'all-tests.json', nockDone => {

  let httpServer = null

  before( async () => {
    await connectMongoose(process.env.MONGODB_URI) 

    await mongoose.connection.db.dropDatabase()
  })

  after( () => nockDone() )

  describe('~ efx-trustless-data', async () => {

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
        toBlock: {
          number: 8261329,
        },
        fromBlock: {
          number: 8232529, // roughly 8 hours
        } 
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

      // TODO: automated test for ranking, this test was validated manually
      assert.equal(ranking[17].address, '0xd1480f6e2da2f39ea4323d93c0af0db5979227a2')
      assert.equal(ranking[17].amount, 2.0464377233173687)
    })

    it('calculate token ranking for a given date', async () => {
      const ranking = await calculateTokenRanking('ETH')

      // TODO: automated test for ranking, this test was validated manually
      assert.equal(ranking[17].address, '0xd1480f6e2da2f39ea4323d93c0af0db5979227a2')
      assert.equal(ranking[17].amount, 2.0464377233173687)
    })

  })



})
