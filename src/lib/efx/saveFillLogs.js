const mongoose = require('mongoose')
const Block = require('../../models/Block')
const Transaction = require('../../models/Transaction')
const Event = require('../../models/Event')

const _ = require('lodash')

const getPrice = require('../bfx/getPrice')
const stableCoins = require('../bfx/stableCoins')

/**
 * 
 * Save fill logs captured by ../0x/getFillLogs ads Market Price where
 * necessary then save to mongodb
 * 
 */
module.exports = async (logs) => {

  // list of mongoose's Block documents
  const blockDocs = []
  const transactionDocs = []
  const eventDocs = []

  for(const blockNumber in logs){

    // TODO: do we 'need' to be immutable here? 
    const block = _.clone(logs[blockNumber])

    block.number = blockNumber

    const numTransactions = Object.keys(block.transactions).length

    block.numTransactions = numTransactions

    const doc = new Block(_.omit(block, 'transactions'))

    doc.transactions = Object.keys(block.transactions)

    blockDocs.push(doc)

    for(const txHash in block.transactions) {

      const tx = block.transactions[txHash]

      tx._id = txHash

      tx.hash = txHash

      // reference to parent block
      tx.blockNumber = blockNumber

      tx.timestamp = block.timestamp

      tx.date = block.date

      const numEvents = tx.events.length

      tx.numEvents = numEvents

      const price = await getPrice('ETH', block.timestamp)

      // use candle open as price
      tx.ETHUSDPrice = price

      tx.priceETH = (tx.gasUsed * tx.gasPrice) / 10e18 // amount of ETH paid
      tx.priceUSD = tx.priceETH * tx.ETHUSDPrice       // amount paid in USD

      const doc = new Transaction(_.omit(tx, 'events'))

      const eventIds = tx.events.map((event) => txHash + '-' + event.logIndex )

      doc.events = eventIds

      doc.numEvents = eventIds.length

      transactionDocs.push(doc)

      for(const index in tx.events){

        const event = tx.events[index]

        event._id = txHash + '-' + event.logIndex

        event.txHash = txHash

        event.blockNumber = block.number

        event.timestamp = block.timestamp

        event.date = block.date

        // if the taker Token is a stable coin
        if(stableCoins[event.maker.token]){
          event.USDValue = event.maker.amount * 1
        } else if(stableCoins[event.taker.token]){
          event.USDValue = event.taker.amount * 1
        } else {
          const price = await getPrice(event.taker.token, block.timestamp)

          event.USDValue = price * event.taker.amount
          // event[event.taker.token + 'USDPrice'] = price
        }

        const doc = new Event(event)

        eventDocs.push(doc)
      }

    }

    // console.log('blockNumber ->', blockNumber)
    // console.log('block ->', block)

  }

  // create mongodb transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  if(blockDocs.length){
    try{
      await Block.collection.insertMany(blockDocs)
  
      // console.log(`- inserted ${blockDocs.length} Block documents`)
    } catch (e) {
      console.log("Error inserting Block docs ->", e)
      session.abortTransaction()
      session.endSession();
      throw(e)
    }  
  }

  if(transactionDocs.length){
    try{
      await Transaction.collection.insertMany(transactionDocs)
  
      // console.log(`- inserted ${transactionDocs.length} Transaction documents`)
    } catch (e) {
      console.log("Error inserting Transaction docs ->", e)
      session.abortTransaction()
      session.endSession();
      throw(e)
    }
  }

  if(eventDocs.length){
    try{
      await Event.collection.insertMany(eventDocs)
  
      // console.log(`- inserted ${eventDocs.length} Event documents`)
    } catch (e) {
      console.log("Error inserting Event docs ->", e)
      session.abortTransaction()
      session.endSession();
      throw(e)
    }
  }

  session.endSession();

  return {
    blocks: blockDocs,
    transactions: transactionDocs,
    events: eventDocs
  }
  

}