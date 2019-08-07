const BigNumber = require('bignumber.js')
const _ = require('lodash')

const findEvents = require('../../models/methods/findEvents')

module.exports = async (startDate, endDate) => {
  // all events for all tokens
  const query = {}

  const events = await findEvents(query, startDate, endDate)

  const volumes = {}

  const computeTrade = (address, amount) => {
    volumes[address] = volumes[address] || new BigNumber(0)

    volumes[address] = volumes[address].plus(amount)
  }

  for(const event of events){

    computeTrade(event.maker.address, event.USDValue)
    computeTrade(event.taker.address, event.USDValue)

  }

  // remove ethfinex address from ranking
  delete volumes['0x61b9898c9b60a159fc91ae8026563cd226b7a0c1']

  const ranking = []

  for(const address in volumes){

    ranking.push({
      address: address,
      USDValue : volumes[address].toNumber()
    })

  }

  const orderedRanking = _.orderBy(ranking, 'USDValue').reverse()

  return orderedRanking
}