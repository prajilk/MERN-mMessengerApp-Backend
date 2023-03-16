const model = require('../db/dbModels')
const userModel = model.Users();

module.exports = {
    findFriends: (username)=> {
        return new Promise(async (resolve, reject)=>{
            const searchResults = await userModel.find({
                $or: [
                    { fullname: { "$regex": username, "$options": "i" } },
                    { username: { "$regex": username, "$options": "i" } }
                ]
            }).lean();
            resolve(searchResults);
        })
    }
}