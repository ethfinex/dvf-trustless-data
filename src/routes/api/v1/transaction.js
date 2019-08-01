const { param } = require('express-validator');

const validatorsAreMet = require('../../../lib/http/validatorsAreMet')

const Transaction = require('../../../models/Transaction')

module.exports = (server) => {
  server.get('/api/v1/transactions/:txHash', [
    param('txHash').isString(),

    validatorsAreMet
  ], async (req, res) => {

    const query = {
      _id: req.params.txHash
    }
    
    const result = await Transaction
      .findOne(query)
      .populate('events', 'type maker taker')

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
