const { param, query } = require('express-validator')
const isTimestamp = require('validate.io-timestamp')
const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const calculateTokenRanking = require('../../../models/methods/calculateTokenRanking')

/**
 * Return ranking of addresses based on their volume for a given token
 */
module.exports = (server) => {
  server.get('/api/v1/tokenRanking/:token', [
    param('token').isString(),

    query('startDate').optional().isInt().toInt().custom((timestamp) => {
      return isTimestamp(timestamp)
    }).withMessage('invalid timestamp'),

    query('endDate').optional().isInt().toInt().custom((timestamp) => {
      return isTimestamp(timestamp)
    }).withMessage('invalid timestamp'),

    validatorsAreMet
  ], async (req, res) => {
    const token = req.params.token

    const startDate = req.query.startDate ? req.query.startDate / 1000 : null
    const endDate = req.query.endDate ? req.query.endDate / 1000 : null

    const result = await calculateTokenRanking(token, startDate, endDate)

    res.setHeader('Content-Type', 'application/json')
    res.send(result || {error: 'not_found'})
  })
}
