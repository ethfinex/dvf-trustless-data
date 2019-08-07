/**
 * Requests daily candle for candle from Bitfinex.
 *
 * Used to calculate USD volume of coins.
 *
 * Retries are needed as sometimes the rate limit is reached, so we retry
 * fetching the candle in 500 ms.
 *
 * TODO: implement a better way of dealing with rate limit
 */
const sleep = require('sleep-promise')
const {get} = require('request-promise')
const moment = require('moment')

const NodeCache = require( "node-cache" )

// stdTTL: 1 HOUR means daa will be cached for 1 hour
// checkperiod: 10 minutes means every 10 minutes we check if we need to flush
const candleCache = new NodeCache( { stdTTL: 60 * 60, checkperiod: 60 * 10 } );

/**
 * Look for OPEN price for the closest 1H candle
 */
module.exports = async (token, blockTimeStamp) => {

  const symbol = `t${token}USD`

  // get timestamp for the start of the hourly candle for this timestamp
  const timestamp = moment.utc(blockTimeStamp * 1000).startOf('hour')

  let candle = candleCache.get(symbol + timestamp)

  // sets .cached property to true when candle comes from cache
  if(candle){
    candle.cached = true
    return candle
  }

  // fetch candle from Bitfinex
  let url = 'https://api.bitfinex.com/v2/candles/trade:1h:' + symbol
  url = url + '/hist?limit=1&end=' + timestamp

  let retries = 0
  let maxRetries = 50

  while(candle == null) {

    try {
      candle = await get(url, {json: true})
      candle = candle[0]

      // caches candle
      candleCache.set(symbol + timestamp, candle)
    } catch(e) {

      console.log("")

      if(e.statusCode == 429){
        console.log( "- rate limited by bfx API")
      } else {
        console.log("error getting daily candle for: ", symbol)
        console.log(e)
      }

      if(retries >= maxRetries){
        throw(e)
      }

      console.log("retrying in 5000ms")
      console.log("")
  
      retries += 1
  
      await sleep(5000 * retries)
    }
  }

  return candle
}
