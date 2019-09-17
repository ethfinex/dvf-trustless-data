const BigNumber = require('bignumber.js')
const _ = require('lodash')
const moment = require('moment')

const calculateVolumeForAddress = require('../../models/methods/calculateVolumeForAddress')

module.exports = async (address, endDate = (moment().valueOf() / 1000)) => {

  // start date is 30 days ago
  const startDate = moment(endDate * 1000).subtract(30, 'days').valueOf() / 1000
  const volume = await calculateVolumeForAddress(address, startDate, endDate)
  let total = volume.TotalUSDValue || 0

  let volumeDiscount

  switch (true) {
    case (total < 150000):
      volumeDiscount = 0
      break;
    case (total < 1000000):
      volumeDiscount = 0.05
      break;
    case (total < 4000000):
      volumeDiscount = 0.10
      break;
    case (total < 9000000):
      volumeDiscount = 0.15
      break;
    case (total < 18000000):
      volumeDiscount = 0.20
      break;
    case (total < 30000000):
      volumeDiscount = 0.25
      break;
    case (total >= 30000000):
      volumeDiscount = 0.30
      break;
  }

  const baseFeeBps = new BigNumber(25)
  const accountFee = [
    baseFeeBps.times(1 - volumeDiscount).toFixed(0),
    baseFeeBps.times(1 - volumeDiscount).times(0.85).toFixed(0),
    baseFeeBps.times(1 - volumeDiscount).times(0.8).toFixed(0),
  ]

  const response = {
    small: {
      threshold: 0,
      feeBps: accountFee[0]
    },
    medium: {
      threshold: 500,
      feeBps: accountFee[1]
    },
    large: {
      threshold: 2000,
      feeBps: accountFee[2]
    }
  }

  return response
}
