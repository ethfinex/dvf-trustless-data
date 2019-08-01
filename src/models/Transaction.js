const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    // we use txHash as _id
    _id : { type: String },

    gasUsed: Number,
    gasPrice: Number,
    priceETH: Number, // the price of this transaction in ETH

    // block number
    blockNumber: { type: Number, index: true },
    
    timestamp:  Number,
    date: { type: Date, index: true },

    // exchangeWrapper contract address
    exchangeWrapper: String, 

    // total events (settements) executed
    numEvents:  Number,

    // referenfce to Transactions model
    events : [{ type : String, ref : 'Event' }],

    // the date the document was created on the database
    createdAt: { type: Date, default: Date.now }
});

// TODO: set to false in production once the indexes are created?
schema.set('autoIndex', true);

module.exports = mongoose.model('Transaction', schema)