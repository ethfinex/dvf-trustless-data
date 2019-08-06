const Block = require('../../models/Block')
const Transaction = require('../../models/Transaction')
const Event = require('../../models/Event')

const _ = require('lodash')

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
      tx.priceETH = (tx.gasUsed * tx.gasPrice) / 10e18 // amount of ETH paid

      console.log("block time stamp ->", block.number, block.timestamp)

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

        const doc = new Event(event)

        eventDocs.push(doc)
      }

    }

    // console.log('blockNumber ->', blockNumber)
    // console.log('block ->', block)

  }

  if(blockDocs.length){
    try{
      await Block.collection.insertMany(blockDocs)
  
      // console.log(`- inserted ${blockDocs.length} Block documents`)
    } catch (e) {
      console.log("Error inserting Block docs ->", e)
    }  
  }

  if(transactionDocs.length){
    try{
      await Transaction.collection.insertMany(transactionDocs)
  
      // console.log(`- inserted ${transactionDocs.length} Transaction documents`)
    } catch (e) {
      console.log("Error inserting Transaction docs ->", e)
    }
  }

  if(eventDocs.length){
    try{
      await Event.collection.insertMany(eventDocs)
  
      // console.log(`- inserted ${eventDocs.length} Event documents`)
    } catch (e) {
      console.log("Error inserting Event docs ->", e)
    }
  }



  return {
    blocks: blockDocs,
    transactions: transactionDocs,
    events: eventDocs
  }
  

}