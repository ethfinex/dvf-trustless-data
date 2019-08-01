const connectMongoose = require('./models/mongoose')

// imports and initiates server
const server = require('./server')

connectMongoose(process.env.MONGODB_URI)

const syncDatabase = require('./jobs/syncDatabase')

syncDatabase()

// watch for new blocks and log data
//const job = require('./jobs/everyBlock')
//job()

// log previous data
//const cache = require('./jobs/cachePreviousBlocks')
//cache()