const { param } = require('express-validator');

const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const Event = require('../../../models/Event')

module.exports = (server) => {
  server.get('/api/v1/taker/:address', [
    param('address').isString(),

    validatorsAreMet
  ], async (req, res) => {

    const query = { 'taker.address': req.params.address }
    
    const result = await Event.find(query)

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
