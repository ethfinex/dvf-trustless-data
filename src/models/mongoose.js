const mongoose = require('mongoose')

// see: https://mongoosejs.com/docs/deprecations.html#-findandmodify-
mongoose.set('useFindAndModify', false)

module.exports = (mongoURI) => {
    const promise = mongoose.connect( mongoURI, {useNewUrlParser: true} )

    mongoose.set('useCreateIndex', true);

    const connection = mongoose.connection

    connection.on('error', () => {
        console.error( " ! mongoose connection error" )
        console.log(arguments)
    });

    connection.once('open', () => {
        console.error( " - mongoose connected" )
    });

    return promise
}
