const sleep = require('sleep-promise')

const getEfxConfig = require('../lib/efx/getConfig')
const State = require('../models/State')
const getBlock = require('../lib/web3/getBlock')

const getFillLogs = require('../lib/0x/getFillLogs')
const saveFillLogs = require('../lib/0x/saveFillLogs')

// blocks behind latest block we will be scanning, for instance
// if latest block is 100 we will be getting the logs until block 93
const NEEDS_TX_FOR_CONFIRMATION = 7

// - Block #8062292 is the last block from June/2019
// - chunkSize is the amount of blocks scanned at at time.
//    -> of 15 * 4 * 60 is roughly 1 hour
module.exports = sync = async (
  fromBlockNumber = 8062292, 
  chunkSize = 15 * 4 * 60
) => {
  
  const config = await getEfxConfig()

  let lastScannedBlock = await State.findOne({_id:'lastScannedBlock'})

  if(!lastScannedBlock){
    await State.create({
      _id:'lastScannedBlock', 
      value: fromBlockNumber
    })

    lastScannedBlock = {value: fromBlockNumber}
  }

  const lastBlock = await getBlock('latest')

  const targetBlockNumber = Math.min(
    lastScannedBlock.value + chunkSize, 
    lastBlock.number - NEEDS_TX_FOR_CONFIRMATION
  )

  // if we have scanned all blocks, then sleep 5 secs and try again
  if(lastScannedBlock.value >= targetBlockNumber){

    // console.log( " - synced! now is sleeping 5 seconds")
    await sleep(1000 * 5)

    sync()

    return
  }

  const range = {
    fromBlock: {
      number: lastScannedBlock.value, // roughly 8 hours
    },
    toBlock: {
      number: targetBlockNumber,
    },
  }

  // console.log(` - scanning: ${targetBlockNumber}/${lastBlock.number}`)

  const scansLeft = Math.ceil((targetBlockNumber/lastBlock.number)/chunkSize)

  // console.log(` - scans left till sync: ${scansLeft}`)

  const logs = await getFillLogs(range)

  const saved = await saveFillLogs(logs)

  console.log(`Saved ${saved.events.length} events`)
  
  const updateScannedBlock = await State.updateOne(
    {_id: 'lastScannedBlock'}, 
    {$set:{value: targetBlockNumber}}
  )

  const updateLastBlock = await State.findOneAndUpdate(
    {_id: 'lastBlock'}, 
    {$set:{value: lastBlock.number}},
    {upsert: true}
  )

  sync()

}