const Game = require("../models/game");

let data = {
    'gameList': [],
}

exports.start = (io) => {
    io.on('connection', (socket) => {
        if (data.gameList.length === 0) {
            let game = new Game()
            console.log('new-game ' + game.number);
            data.gameList.push(game)
            socket.join(game.room)
            socket.emit('new-game', game)
        } else {
            console.log('welcome');
            let activeGameList = data.gameList.filter(function (game) { return game.playerList.length === 1 })
            socket.emit('welcome', activeGameList)
        }
        // let player = 'p1'
        // let opponent = 'p2'
        // if (data.playersList.length > 0) {
        //     player = 'p2'
        //     opponent = 'p1'
        // }
        // console.log('user connected : ' + player)
        // data.playersList.push(player)
        // socket.emit('user-connect', player, opponent)

        socket.on('disconnecting', function () {
            console.log(data.gameList)
            console.log(socket.rooms)
            let rooms = socket.rooms
            rooms.forEach(function (room) {
                let gameIndex = data.gameList.findIndex((game) => game.room === room)
                if (gameIndex !== -1) {
                    console.log('user disconnected from game : ' + room)
                    data.gameList.splice(gameIndex, 1)
                }
            })
            console.log(data.gameList)
        })
    })
}
