const mongoose = require('mongoose')
const Schema = require('./dbSchemas')

const Users = mongoose.model('Users', Schema.userSchema());

module.exports = {
    Users: ()=>{
        return Users;
    }
}