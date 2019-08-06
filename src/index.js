const connectMongoose = require('./models/mongoose')

// imports and initiates server
const server = require('./server')

connectMongoose(process.env.MONGODB_URI)

const syncDatabase = require('./jobs/syncDatabase')

// For development it's recommented to run tess once and stay with a small
// dataset locally for tests.
if(process.env.NODE_ENV == 'production'){
  syncDatabase()
}
