// setup webserver
const express = require('express')
const cors = require('cors')
const path = require('path')

const PORT = process.env.PORT || 5000

const server = express()

console.log( "created server")

server
  .disable('x-powered-by')
  .use(cors())

  .listen(PORT, () => console.log(` - HTTP API on port: ${ PORT }`))

// add routes

require('./routes/api/v1/block')(server)
require('./routes/api/v1/event')(server)
require('./routes/api/v1/maker')(server)
require('./routes/api/v1/transaction')(server)



module.exports = server