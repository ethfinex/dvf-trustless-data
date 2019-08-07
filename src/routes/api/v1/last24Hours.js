const { param, query } = require('express-validator');
const isTimestamp = require('validate.io-timestamp')
const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const moment = require('moment')

const cacheFunction = require('../../../lib/cache/cacheFunction')

const calculateVolume = require('../../../models/methods/calculateVolume')


/**
 * Return 24 Hours volume for each token and also TotalUSDValue
 */
module.exports = (server) => {
  server.get('/api/v1/last24Hours', [
    validatorsAreMet
  ], async (req, res) => {

    // start date is 24 hours ago
    const startDate = moment().subtract(24, 'hours').valueOf() / 1000

    const result = await cacheFunction('last24Hours', 60, async () => {
      const result = await calculateVolume(startDate)
      result.startDate = moment(startDate * 1000).toDate()

      return result
    })

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
