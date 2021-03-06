const { query } = require('express-validator')
const isTimestamp = require('validate.io-timestamp')
const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const calculateUSDRanking = require('../../../models/methods/calculateUSDRanking')

/**
 * Return ranking of addresses based on their USD Worth volume
 */
module.exports = (server) => {
  server.get('/api/v1/USDRanking/', [
    query('startDate').optional().isInt().toInt().custom((timestamp) => {
      return isTimestamp(timestamp)
    }).withMessage('invalid timestamp'),

    query('endDate').optional().isInt().toInt().custom((timestamp) => {
      return isTimestamp(timestamp)
    }).withMessage('invalid timestamp'),

    validatorsAreMet
  ], async (req, res) => {
    const startDate = req.query.startDate ? req.query.startDate / 1000 : null
    const endDate = req.query.endDate ? req.query.endDate / 1000 : null

    const result = await calculateUSDRanking(startDate, endDate)

    res.setHeader('Content-Type', 'application/json')
    res.send(result)
  })
}
