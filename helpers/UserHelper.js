const model = require('../db/dbModels')
const bcrypt = require("bcrypt");

const userModel = model.Users();
const friendModel = model.Friends()

// Genarate random color for user avatar
function generateRandomColor() {
    let maxVal = 0xFFFFFF; // 16777215
    let randomNumber = Math.random() * maxVal;
    randomNumber = Math.floor(randomNumber);
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);
    return randColor.toUpperCase()
}

module.exports = {
    signUp: async (userData) => {
        return new Promise(async (resolve, reject) => {
            const isUsernameTaken = await userModel.exists({ username: userData.username });
            const isEmailTaken = await userModel.exists({ email: userData.email });
            if (isUsernameTaken && isEmailTaken) {
                reject('both');
                return
            } else if (isUsernameTaken) {
                reject('username');
                return
            } else if (isEmailTaken) {
                reject('email');
                return
            } else {
                userData.password = await bcrypt.hash(userData.password, 10); // HASH the user password.
                userData.color = generateRandomColor(); // Create a random color code for user avatar.
                await new userModel(userData).save();

                // Create a friend Model to handle user's friends
                const validUser = await userModel.findOne({ email: userData.email });
                await new friendModel({ userId: validUser._id }).save();
                
                resolve();
            }
        })
    },
    signIn: (userData) => {
        return new Promise(async (resolve, reject) => {
            const validUser = await userModel.findOne({ email: userData.email });
            if (validUser) {
                try {
                    if (await bcrypt.compare(userData.password, validUser.password)) {
                        await friendModel.findOneAndUpdate(
                            { userId: validUser._id },
                            {
                                $push: { friends: [] }
                            },
                            { upsert: true, new: true }
                        )
                        resolve(validUser);
                    } else {
                        reject();
                    }
                } catch (err) { console.log("Somthing went wrong!") }
            } else {
                reject();
            }
        })
    }
}