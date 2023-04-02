const friendsHelper = require('../helpers/FriendsHelper')
const chatHelper = require('../helpers/ChatHelper')
const { encrypt, decrypt } = require('../Encryption/encrypt')

module.exports = (io) => {

    const users = {};

    io.on('connection', socket => {

        console.log("Device connected: " + socket.id);

        socket.on('disconnect', () => {
            console.log("Device disconnected: " + socket.id);
            delete users[socket.id];
        });

        socket.on('joinRoom', (roomId) => {
            users[socket.id] = roomId;
            socket.join(roomId);
        });

        socket.on('signout', (user) => {
            const keyToDelete = Object.keys(users).find(key => users[key] === user);
            delete users[keyToDelete];
        })

        socket.on('check-online', (userId, callback) => {
            if (Object.values(users).indexOf(userId) > -1)
                callback(true)
            else
                callback(false)
        })

        socket.on('sendTyping', (user, receiver) => {
            socket.to(receiver).emit('sendTyping', user._id)
        })

        socket.on('sent-request', (user, receiver) => {
            friendsHelper.sendRequest(user, receiver).then(() => {
                friendsHelper.getFriendsRequests(receiver).then((res) => {
                    socket.to(receiver).emit('friend-request-notification', res);
                });
            });
        })
        socket.on('accept-request', (user, receiver) => {
            friendsHelper.acceptRequest(user, receiver).then(() => {
                friendsHelper.getFriendsList(receiver).then((res) => {
                    socket.to(receiver).emit('update-friend-list', res);
                })
            });
        })
        socket.on('reject-request', (user, receiver) => {
            friendsHelper.rejectRequest(user, receiver);
        })
        socket.on('ready-to-send-message', (user, receiver) => {
            chatHelper.addToChatList(user, receiver);
        })
        socket.on('send-message', ({ message, timestamp }, sender, receiver) => {
            const hashMessage = encrypt(message);
            chatHelper.saveChatMessage(hashMessage, sender, receiver).then(() => {
                socket.to(receiver).emit('recieve-message', { sender, message, timestamp });
            })
        })

    })
}