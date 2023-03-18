const friendsHelper = require('../helpers/FriendsHelper')

module.exports = (io) => {

    io.on('connection', socket => {

        console.log("Device connected: " + socket.id);

		socket.on('disconnect', () => {
            console.log("Device disconnected: " + socket.id);
        });
        
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
        });

        socket.on('sent-request', (user, receiver) => {
            friendsHelper.sendRequest(user, receiver).then(()=>{
                friendsHelper.getFriendsRequests(receiver).then((res)=>{
                    socket.to(receiver).emit('friend-request-notification', res);
                });
            });
        })
        socket.on('accept-request', (user, receiver)=>{
            friendsHelper.acceptRequest(user, receiver).then(()=>{
                friendsHelper.getFriendsList(receiver).then((res)=>{
                    socket.to(receiver).emit('update-friend-list', res);
                })
            });
        })
        socket.on('reject-request', (user, receiver)=>{
            friendsHelper.rejectRequest(user, receiver).then();
        })
		
	})
}