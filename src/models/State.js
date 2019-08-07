/**
 * Simple Key->Value store on mongo in order to keep application state
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
  // block number
  _id: { type: String },

  value: mongoose.Mixed
})

module.exports = mongoose.model('State', schema)
