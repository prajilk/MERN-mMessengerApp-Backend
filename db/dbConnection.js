const mongoose = require('mongoose')
require('dotenv').config()
 
async function connect() {
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log('connected to database');
}

module.exports = connect;