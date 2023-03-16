const mongoose = require('mongoose')
const Schema = require('./dbSchemas')

module.exports = {
    Users: ()=>{
        const Users = mongoose.model('Users', Schema.userSchema());
        return Users;
    }
}