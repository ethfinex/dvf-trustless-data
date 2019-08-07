const { param } = require('express-validator')
const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const moment = require('moment')

const cacheFunction = require('../../../lib/cache/cacheFunction')

const calculateVolumeForAddress = require('../../../models/methods/calculateVolumeForAddress')

/**
 * Return 30 days USD Volume for a given address
 */
module.exports = (server) => {
  server.get('/api/v1/30DaysVolume/:address', [
    param('address').isString(),

    validatorsAreMet
  ], async (req, res) => {
    // start date is 30 days ago
    const startDate = moment().subtract(30, 'days').valueOf() / 1000

    const address = req.params.address

    // key we will use to cache this calculation
    const cacheKey = '30DaysVolume:' + address
    // cache calculation for 1 Hour
    const cacheTime = 60 * 60

    const result = await cacheFunction(cacheKey, cacheTime, async () => {
      const result = await calculateVolumeForAddress(address, startDate)
      result.startDate = moment(startDate * 1000).toDate()

      return result
    })

    res.setHeader('Content-Type', 'application/json')
    res.send(result || {error: 'not_found'})
  })
}
