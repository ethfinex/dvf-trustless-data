const BigNumber = require('bignumber.js')
const _ = require('lodash')

const findEvents = require('../../models/methods/findEvents')

module.exports = async (startDate, endDate) => {

  // fetch all events during startDate and endDate
  const query = {}
  const events = await findEvents(query, startDate, endDate)

  const tokenVolumes = {}

  // total USDWorth for all trades
  let USDWorth = new BigNumber(0)

  const computeTrade = (token, amount, USDValue) => {
    tokenVolumes[token] = tokenVolumes[token] || {
      tokenAmount: new BigNumber(0),
      USDValue: new BigNumber(0)
    }

    tokenVolumes[token].tokenAmount = tokenVolumes[token].tokenAmount.plus(amount)

    tokenVolumes[token].USDValue = tokenVolumes[token].USDValue.plus(USDValue)
  }

  for(const event of events){
    computeTrade(event.maker.token, event.maker.amount, event.USDValue)
    computeTrade(event.taker.token, event.taker.amount, event.USDValue)

    USDWorth = USDWorth.plus(event.USDValue)
    USDWorth = USDWorth.plus(event.USDValue)
  }

  // convert BigNumber instances to Number
  for(const token in tokenVolumes){
    tokenVolumes[token].tokenAmount = tokenVolumes[token].tokenAmount.toNumber()
    tokenVolumes[token].USDValue = tokenVolumes[token].USDValue.toNumber()
  }

  const response = {
    TotalUSDValue: USDWorth.toNumber(),
    tokens: tokenVolumes
  }

  return response
}
