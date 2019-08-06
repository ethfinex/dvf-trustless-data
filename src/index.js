const connectMongoose = require('./models/mongoose')

// imports and initiates server
const server = require('./server')

connectMongoose(process.env.MONGODB_URI)

const syncDatabase = require('./jobs/syncDatabase')

// syncDatabase()