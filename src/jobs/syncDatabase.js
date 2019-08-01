const sleep = require('sleep-promise')

const getEfxConfig = require('../lib/efx/getConfig')
const State = require('../models/State')
const getBlock = require('../lib/web3/getBlock')

const getFillLogs = require('../lib/0x/getFillLogs')
const saveFillLogs = require('../lib/0x/saveFillLogs')

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

  // if we have scanned all blocks, then sleep 5 secs and try again
  if(lastScannedBlock.value == lastBlock.number){

    // console.log( " - synced! now is sleeping 5 seconds")
    await sleep(1000 * 5)

    sync()

    return
  }

  const targetBlock = Math.min(
    lastScannedBlock.value + chunkSize, 
    lastBlock.number
  )

  const range = {
    fromBlock: {
      number: lastScannedBlock.value, // roughly 8 hours
    },
    toBlock: {
      number: targetBlock,
    },
  }

  // console.log(` - scanning: ${targetBlock}/${lastBlock.number}`)

  const scansLeft = Math.ceil((targetBlock/lastBlock.number)/chunkSize)

  // console.log(` - scans left till sync: ${scansLeft}`)

  const logs = await getFillLogs(range)

  const saved = await saveFillLogs(logs)

  const update = await State.updateOne(
    {_id: 'lastScannedBlock'}, 
    {$set:{value: targetBlock}}
  )

  sync()

}