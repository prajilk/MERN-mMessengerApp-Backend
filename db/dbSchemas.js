const mongoose = require('mongoose')

const Schema = mongoose.Schema;

module.exports = {
    userSchema: ()=>{
        const userSchema = Schema({
            fullname: String,
            username: String,
            email: String,
            password: String,
            color: String
        },{collection: 'users', versionKey: false})
        return userSchema;
    }
}