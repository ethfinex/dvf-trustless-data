const BigNumber = require('bignumber.js')
const _ = require('lodash')

const findEvents = require('../../models/methods/findEvents')

module.exports = async (token, startDate, endDate) => {
  const query = { $or: [
    { 'maker.token': token },
    { 'taker.token': token }
  ]}

  const events = await findEvents(query, startDate, endDate)

  const volumes = {}

  const computeTrade = (address, amount) => {
    volumes[address] = volumes[address] || new BigNumber(0)

    volumes[address] = volumes[address].plus(amount)
  }

  for(const event of events){

    if(event.maker.token == token){
      computeTrade(event.maker.address, event.maker.amount)
      computeTrade(event.taker.address, event.maker.amount)
    }

    if(event.taker.token == token){
      computeTrade(event.maker.address, event.taker.amount)
      computeTrade(event.taker.address, event.taker.amount)
    }
  }

  const ranking = []

  for(const address in volumes){

    ranking.push({
      address: address,
      amount : volumes[address].toNumber()
    })

  }

  const orderedRanking = _.orderBy(ranking, 'amount').reverse()

  return orderedRanking
}