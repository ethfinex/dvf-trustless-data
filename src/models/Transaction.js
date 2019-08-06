const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    // we use txHash as _id
    _id : { type: String },

    gasUsed: Number,
    gasPrice: Number,
    priceETH: Number, // the price of this transaction in ETH

    // TODO: add
    //   - ETHUsdPrice : ETH USD price at this block
    //   - priceUSD    : USD value paid in Gas

    // block number
    blockNumber: { type: Number, index: true },
    
    // block time
    timestamp:  Number,
    date: { type: Date, index: true },

    // total events (settements) executed
    numEvents:  Number,

    // reference to Transactions model
    events : [{ type : String, ref : 'Event' }],

    // the date the document was created on the database
    createdAt: { type: Date, default: Date.now }
});

// TODO: set to false in production once the indexes are created?
schema.set('autoIndex', true);

module.exports = mongoose.model('Transaction', schema)