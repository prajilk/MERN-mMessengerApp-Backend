const model = require('../db/dbModels')
const bcrypt = require("bcrypt");
const userModel = model.Users();

module.exports = {
    signUp: async (userData) => {
        return new Promise(async (resolve, reject) => {
            const isUsernameTaken = await userModel.exists({ username: userData.username });
            const isEmailTaken = await userModel.exists({ email: userData.email });
            if (isUsernameTaken && isEmailTaken) {
                reject('both');
                return
            } else if(isUsernameTaken){
                reject('username');
                return
            } else if(isEmailTaken){
                reject('email');
                return
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                new userModel(userData).save();
                resolve();
            }
        })
    },
    signIn: (userData) =>{
        return new Promise(async (resolve, reject) =>{
            const validUser = await userModel.findOne({email: userData.email});
            if(validUser){
                try{
                    if(await bcrypt.compare(userData.password, validUser.password)){
                        resolve(validUser);
                    } else {
                        reject();
                    }
                } catch(err) { console.log("Somthing went wrong!") }
            } else {
                reject();
            }
        })
    }
}