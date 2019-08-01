const mongoose = require('mongoose')
const Schema = mongoose.Schema

const makerTakerSchema = new Schema({
  address: { type: String, index: true },
  token: String,
  tokenAddress: String,
  amount: Number
}, {_id: false})

const schema = new Schema({
  // we use txHash + '-' + logIndex as unique _id for events
  _id: String,

  type: String, // so far we only have "Fill"

  logIndex: Number,
  
  maker: { type: makerTakerSchema },

  taker: { type: makerTakerSchema },

  // info from parent TX and Block

  txHash: { type: String, index: true },

  blockNumber: { type: Number, index: true },

  // timestamp and date from parent Block
  timestamp: Number,
  date: { type: Date, index: true },

  // the date the document was created on the database
  createdAt: { type: Date, default: Date.now }
});

// make combination of "txHash + logIndex" unique, so there
// is not the possibility of duplicating records between 
// different updates and versions
schema.index({ 
  txHash: 1, 
  logIndex: 1
}, { unique: true })

// TODO: set to false in production once the indexes are created?
schema.set('autoIndex', true);

module.exports = mongoose.model('Event', schema)