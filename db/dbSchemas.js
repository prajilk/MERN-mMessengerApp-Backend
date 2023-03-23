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
    },
    chatSchema: ()=>{
        const chatSchema = Schema({
            user_1: mongoose.Schema.Types.ObjectId,
            user_2: mongoose.Schema.Types.ObjectId,
            chats: Array
        },{collection: 'chats', versionKey: false})
        return chatSchema;
    }
}
  

/* 
    {
        userId: "bjb6787278v833g7737f72",
        chats: [
            {
                recipient: "knwjb2iubwib2iebi99378",
                messages: [
                    {
                        sender: "knwjb2iubwib2iebi99378",
                        message: "Hi"
                    },
                    {
                        sender: "bjb6787278v833g7737f72",
                        message: "Hello"
                    },
                    {
                        sender: "knwjb2iubwib2iebi99378",
                        message: "How are u"
                    },
                    {
                        sender: "bjb6787278v833g7737f72",
                        message: "fine , how r u"
                    },
                ]
            },
            {
                recipient2: "mojbibpijbiouboiuboiui",
                messages: []
            }
        ]
    }
*/