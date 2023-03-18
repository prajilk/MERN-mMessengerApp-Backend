const mongoose = require('mongoose');
const model = require('../db/dbModels')
const userModel = model.Users();
const friendModel = model.Friends();

module.exports = {
    findFriends: (username) => {
        return new Promise(async (resolve, reject) => {
            const searchResults = await userModel.find({
                $or: [
                    { fullname: { "$regex": username, "$options": "i" } },
                    { username: { "$regex": username, "$options": "i" } }
                ]
            }).limit(15).lean();
            resolve(searchResults);
        })
    },
    addFriendsStatus: (user, searchResults) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Use Promise.all() to wait for all Promises to resolve
                const resultsWithStatus = await Promise.all(searchResults.map(async (friend) => {
                    const status = await friendModel.aggregate([
                        { $match: { userId: new mongoose.Types.ObjectId(user) } },
                        // {
                        //     $addFields: {
                        //         status: {
                        //             $cond: {
                        //                 if: { $in: [friend._id.toString(), "$friends"] }, then: "friends",
                        //                 else: {
                        //                     $cond: {
                        //                         if: { $in: [friend._id.toString(), "$pending"] }, then: "pending",
                        //                         else: {
                        //                             $cond: {
                        //                                 if: { $in: [friend._id.toString(), "$requests"] }, then: "requests",
                        //                                 else: null
                        //                             }
                        //                         }
                        //                     }
                        //                 }
                        //             }
                        //         }
                        //     }
                        // },
                        // { "$project": { _id: 0, status: 1 } }
                    ]);

                    // Return a updated object with the friend's data and status
                    console.log(status);
                    // return { ...friend, status: status[0].status };
                }));
                resolve(resultsWithStatus);
            } catch (err) {
                reject(err);
            }
        });
    },
    sendRequest: (user, recipientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await Promise.all([
                    friendModel.findOneAndUpdate(
                        { userId: user._id },
                        { $push: { requests: recipientId } },
                        { upsert: true, new: true }
                    ),
                    friendModel.findOneAndUpdate(
                        { userId: recipientId },
                        { $push: { pending: user._id } },
                        { upsert: true, new: true }
                    )
                ]);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },
    acceptRequest: (user, recipientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await Promise.all([
                    friendModel.findOneAndUpdate(
                        { userId: user._id },
                        { $push: { friends: recipientId }, $pull: { pending: recipientId } },
                        { upsert: true, new: true }
                    ),
                    friendModel.findOneAndUpdate(
                        { userId: recipientId },
                        { $push: { friends: user._id }, $pull: { requests: user._id } },
                        { upsert: true, new: true }
                    )
                ]);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },
    rejectRequest: (user, recipientId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await Promise.all([
                    friendModel.findOneAndUpdate(
                        { userId: user._id },
                        { $pull: { pending: recipientId } },
                        { upsert: true, new: true }
                    ),
                    friendModel.findOneAndUpdate(
                        { userId: recipientId },
                        { $pull: { requests: user._id } },
                        { upsert: true, new: true }
                    )
                ]);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    },
    getFriendsRequests: (user) => {
        return new Promise(async (resolve, reject) => {
            try {
                const requestList = await friendModel.aggregate([
                    {
                        $match: { userId: new mongoose.Types.ObjectId(user) }
                    },
                    { $unwind: '$pending' },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'pending',
                            foreignField: '_id',
                            as: 'pendingReq'
                        }
                    }
                    // {
                    //     $lookup: {
                    //         from: "users",
                    //         localField: "pending",
                    //         foreignField: "_id",
                    //         as: "pendingRequests"
                    //     }
                    // },
                    // {
                    //     $project: {
                    //         _id: 0,
                    //         pendingRequests: 1
                    //     }
                    // }
                ])
                console.log(requestList[0]);
                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }
}