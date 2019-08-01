const { param } = require('express-validator');

const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const Event = require('../../../models/Event')

module.exports = (server) => {
  server.get('/api/v1/events/:mongoId', [
    param('mongoId').isString(),

    validatorsAreMet
  ], async (req, res) => {

    const query = { _id: req.params.mongoId }
    
    const result = await Event.findOne(query)

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
