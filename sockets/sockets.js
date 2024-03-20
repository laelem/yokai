let data = {
    'playersList': [],
}

exports.start = (io) => {
    io.on('connection', (socket) => {
        let player = 'p1'
        let opponent = 'p2'
        if (data.playersList.length > 0) {
            player = 'p2'
            opponent = 'p1'
        }
        console.log('user connected : ' + player)
        data.playersList.push(player)
        socket.emit('user-connect', player, opponent)

        socket.on('disconnect', function () {
            player = data.playersList.pop()
            console.log('user disconnected : ' + player)
        })
    })
}
