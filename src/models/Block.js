/**
 * 
 *  - validate addresses using web3.utils.isAddress or package:
 * 'mongoose-type-ethereum-address'
 * 
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    // block number
    number: { type: Number, index: true },
    
    timestamp:  Number,
    date: { type: Date, index: true },

    // exchangeWrapper contract address
    exchangeWrapper: String, 

    // feeRecipientAddress contract address
    feeRecipientAddress: String, 
    numTransactions:  Number,

    // referenfce to Transactions model
    transactions : [{ 
        type : String, 
        ref : 'Transaction' }
    ],

    // the date the document was created on the database
    createdAt: { type: Date, default: Date.now }
});

// make combination of "block + exchangeWrapper + feeRecipient" unique, so there
// is not the possibility of duplicating records between different updates
// and versions
schema.index({ 
    number: 1, 
    exchangeWrapper: 1, 
    feeRecipientAddress: 1
}, { unique: true })

// TODO: set to false in production once the indexes are created?
schema.set('autoIndex', true);

module.exports = mongoose.model('Block', schema)