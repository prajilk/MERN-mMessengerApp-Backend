const mongoose = require('mongoose');
const model = require('../db/dbModels')
const chatModel = model.Chats();

module.exports = {
    addToChatList: (user, receiver) => {
        return new Promise(async (resolve, reject) => {
            await chatModel.findOneAndUpdate(
                { $or: [{ user_1: user._id, user_2: receiver }, { user_1: receiver, user_2: user._id }] },
                {user_1: user, user_2: receiver},
                { upsert: true });
            resolve();
        })
    },
    getChatList: (user) => {
        return new Promise(async (resolve, reject) => {
            const chatList = await chatModel.aggregate([
                {
                    $match: {
                        $or: [
                            { user_1: new mongoose.Types.ObjectId(user) },
                            { user_2: new mongoose.Types.ObjectId(user) }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chats: 1,
                        recipient: {
                            $cond: [
                                { $eq: [ "$user_1", new mongoose.Types.ObjectId(user) ] }, "$user_2", "$user_1"
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "recipient",
                        foreignField: "_id",
                        as: "receiver_details"
                    }
                },
                { $unwind: "$receiver_details" },
                {
                    $project: {
                        recipient: 0
                    }
                }
            ])
            resolve(chatList);
        })
    },
    saveChatMessage: (message, sender, receiver) =>{
        return new Promise(async (resolve, reject) =>{
            await chatModel.updateOne(
                {
                    $or: [
                        { user_1: new mongoose.Types.ObjectId(sender), user_2: new mongoose.Types.ObjectId(receiver) },
                        { user_1: new mongoose.Types.ObjectId(receiver), user_2: new mongoose.Types.ObjectId(sender) }
                    ]
                },
                {
                    $addToSet: { 
                        chats: { 
                            sender: new mongoose.Types.ObjectId(sender), 
                            message: message,
                            timestamp: new Date()
                        } }
                }
            )
            resolve();
        })
    }
}