const { param, query } = require('express-validator');
const isTimestamp = require('validate.io-timestamp')
const validatorsAreMet = require('../../../../lib/http/validatorsAreMet')

const findEvents = require('../../../../models/methods/findEvents')

module.exports = (server) => {
  server.get('/api/v1/events/taker/:address', [
    param('address').isString(),

    query('startDate').optional().isInt().toInt().custom((timestamp) => {
      return isTimestamp(timestamp)
    }).withMessage('invalid timestamp'),

    query('endDate').optional().isInt().toInt().custom((timestamp) => {
      return isTimestamp(timestamp)
    }).withMessage('invalid timestamp'),

    validatorsAreMet
  ], async (req, res) => {

    const query = { 'taker.address': req.params.address }
    
    const startDate = req.query.startDate ? req.query.startDate / 1000 : null
    const endDate = req.query.endDate ? req.query.endDate / 1000 : null

    const result = await findEvents(query, startDate, endDate)

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
