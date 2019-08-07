const { param, query } = require('express-validator');
const isTimestamp = require('validate.io-timestamp')
const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const calculateVolume = require('../../../models/methods/calculateVolume')

const moment = require('moment')

/**
 * Return 24 Hours volume
 */
module.exports = (server) => {
  server.get('/api/v1/last24Hours', [
    validatorsAreMet
  ], async (req, res) => {

    // start date is 24 hours ago
    const startDate = moment().subtract(24, 'hours').valueOf() / 1000

    const result = await calculateVolume(startDate)

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
