const getDailyCandle = require('./getDailyCandle')

module.exports = async (tokens, dayTimestamp) => {
  const prices = {USD: 1, DAI: 1}

  for(let token of tokens){

    // we consider USD and DAI to be always 1 when calculating volume
    if(prices[token]) continue

    const price = await getDailyCandle(`t${token}USD`, dayTimestamp * 1000)

    // get close price of the candle
    prices[token] = price[0][2]
  }

  return prices
}
