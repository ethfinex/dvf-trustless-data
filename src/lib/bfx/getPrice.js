const getHourlyCandle = require('./getHourlyCandle')

/**
 * We will always return 1 USD for stable coins
 */
const stableCoins = require('./stableCoins')

module.exports = async (token, blockTimeStamp) => {
  if (stableCoins[token]) {
    return 1
  }

  const candle = await getHourlyCandle(token, blockTimeStamp)

  // return the open price for the 1 Hour candle
  return candle[2]
}
