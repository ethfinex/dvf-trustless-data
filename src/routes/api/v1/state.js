const State = require('../../../models/State')

module.exports = (server) => {
  server.get('/api/v1/state', async (req, res) => {

    const result = await State.find({}).select('_id value')

    res.setHeader('Content-Type', 'application/json');
    res.send(result || {error: 'not_found'})
  } )
}
