const mongoose = require('mongoose')
const Schema = require('./dbSchemas')

const Users = mongoose.model('Users', Schema.userSchema());
const Friends = mongoose.model('Freiends', Schema.friendSchema());

module.exports = {
    Users: ()=>{
        return Users;
    },
    Friends: ()=>{
        return Friends;
    }
}