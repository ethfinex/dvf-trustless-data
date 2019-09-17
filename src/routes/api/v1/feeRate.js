const { param } = require('express-validator')
const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const cacheFunction = require('../../../lib/cache/cacheFunction')

const calculateVolumeForAddress = require('../../../models/methods/calculateFeeForAddress')

/**
 * Return current fee rate for a given address
 */
module.exports = (server) => {
  server.get('/api/v1/feeRate/:address', [
    param('address').isString(),

    validatorsAreMet
  ], async (req, res) => {

    const address = req.params.address.toLowerCase()

    // key we will use to cache this calculation
    const cacheKey = 'feeRate:' + address
    // cache calculation for 1 Hour
    const cacheTime = 60 * 60

    const result = await cacheFunction(cacheKey, cacheTime, async () => {
      const result = await calculateFeeForAddress(address)

      return result
    })

    res.setHeader('Content-Type', 'application/json')
    res.send(result || {error: 'not_found'})
  })
}
