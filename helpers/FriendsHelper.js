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
                        { $match: { userId: new mongoose.Types.ObjectId(user)} },
                        {
                            $addFields: {
                                status: {
                                    $cond: {
                                        if: { $in: [ friend._id.toString(), "$friends" ] }, then: "friends",
                                        else: {
                                            $cond: {
                                                if: { $in: [ friend._id.toString(), "$pending" ] }, then: "pending",
                                                else: {
                                                    $cond: {
                                                        if: { $in: [ friend._id.toString(), "$requests" ] }, then: "requests",
                                                        else: null
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        { "$project": { _id: 0, status: 1 } }
                    ]);

                    // Return a updated object with the friend's data and status
                    return { ...friend, status: status[0].status };
                }));
                resolve(resultsWithStatus);
            } catch (err) {
                reject(err);
            }
        });
    }
    ,
    sendRequest: (user, recipientId) => {
        return new Promise(async (resolve, reject) => {
            await friendModel.findOneAndUpdate(
                { userId: user },
                { $push: { requests: recipientId } },
                { upsert: true, new: true }
            )
            resolve();
        })
    }
}