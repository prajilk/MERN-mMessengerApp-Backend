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
    },
    friendSchema: ()=>{
        const friendSchema = Schema({
            userId: mongoose.Schema.Types.ObjectId,
            friends: [mongoose.Schema.Types.ObjectId],
            requests: [mongoose.Schema.Types.ObjectId],
            pending: [mongoose.Schema.Types.ObjectId]
        },{collection: 'friends', versionKey: false})
        return friendSchema;
    }
}
  