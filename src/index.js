const BigNumber = require('bignumber.js')
const connectMongoose = require('./models/mongoose')

// set decimal places to 18
BigNumber.config({ DECIMAL_PLACES: 18 })

// imports and initiates server
const server = require('./server')

connectMongoose(process.env.MONGODB_URI)

const syncDatabase = require('./jobs/syncDatabase')

// For development it's recommented to run tess once and stay with a small
// dataset locally for tests.
syncDatabase()
