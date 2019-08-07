const { param } = require('express-validator')
const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const moment = require('moment')

const cacheFunction = require('../../../lib/cache/cacheFunction')

const calculateVolume = require('../../../models/methods/calculateVolume')

/**
 * Return 24 Hours volume for each token and also TotalUSDValue
 */
module.exports = (server) => {
  server.get('/api/v1/24HoursVolume/:year/:month/:day', [
    param('year').isInt().toInt(),
    param('month').isInt().toInt(),
    param('day').isInt().toInt(),

    validatorsAreMet
  ], async (req, res) => {
    const year = req.params.year
    const month = req.params.month
    const day = req.params.day

    // date created using URL parameters
    const date = moment.utc()
      .year(year)
      .month(month - 1)
      .date(day)
      .hours(0)
      .minutes(0)
      .seconds(0)

    const startDate = date.valueOf() / 1000

    // start date is 24 hours ago
    const endDate = date.add(24, 'hours').valueOf() / 1000

    // key we will use to cache this calculation
    const cacheKey = '24HoursVolume:' + year + ':' + month + ':' + day
    // cache calculation for 24 Hours
    const cacheTime = 60 * 60 * 24

    const result = await cacheFunction(cacheKey, cacheTime, async () => {
      const result = await calculateVolume(startDate, endDate)
      result.startDate = moment(startDate * 1000).utc().toDate()
      result.endDate = moment(endDate * 1000).utc().toDate()

      return result
    })

    res.setHeader('Content-Type', 'application/json')
    res.send(result || {error: 'not_found'})
  })
}
