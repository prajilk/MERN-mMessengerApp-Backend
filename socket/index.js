module.exports = (io) => {

    io.on('connection', socket => {

        console.log("Device connected: " + socket.id);

		socket.on('disconnect', () => {
            console.log("Device disconnected: " + socket.id);
        }); 

        socket.on('sent-request', (user, receiver) => {
            console.log("sender: " + user._id);
            console.log("receiver: " + receiver);
        })
		
	})
}