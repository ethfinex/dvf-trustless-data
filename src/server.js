// setup webserver
const express = require('express')
const cors = require('cors')
const path = require('path')

const PORT = process.env.PORT || 5000

const server = express()

console.log( " - starting HTTP API")

// add routes

require('./routes/api/v1/state')(server)

require('./routes/api/v1/block')(server)
require('./routes/api/v1/transaction')(server)
require('./routes/api/v1/event')(server)

require('./routes/api/v1/events/maker')(server)
require('./routes/api/v1/events/taker')(server)

require('./routes/api/v1/tokenRanking')(server)

module.exports = new Promise( (resolve, reject) => {
  server
    .disable('x-powered-by')
    .use(cors())

    .listen(PORT, () => {
      console.log(` - HTTP API online, PORT: ${ PORT }`)
      resolve(server)
    })
})