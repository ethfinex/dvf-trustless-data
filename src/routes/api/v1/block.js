const { param } = require('express-validator');

const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const Block = require('../../../models/Block')

module.exports = (server) => {
  server.get('/api/v1/block/:blockNumber', [
    param('blockNumber').isInt().toInt(),

    validatorsAreMet
  ], async (req, res) => {

    const query = {
        number: req.params.blockNumber
    }
    
    // const result = await Block.findOne(query)

    // TODO: shall we populate the transactions when querying for block?
    const result = await Block.find(query)
      .populate({
        path: 'transactions',
        populate: {
          path: 'events',
          select: 'type USDValue maker taker'
        }
      })

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
