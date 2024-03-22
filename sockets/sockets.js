const Game = require("../models/game");

let data = {
    'gameList': [],
}

exports.start = (io) => {
    io.on('connection', (socket) => {
        if (data.gameList.length === 0) {
            let game = new Game()
            data.gameList.push(game)
            socket.join(game.id)
            socket.emit('first-user-connected', game)
        } else {
            let availableGameList = data.gameList.filter(function (game) { return game.playerList.length === 1 })
            socket.emit('user-connected', availableGameList)
        }

        socket.on('new-game-requested', function() {
            // recherche d'un numéro de partie disponible
            let numberList = data.gameList.map((game) => game.number)
            let number = 2
            while(numberList.includes(number)) { number++ }
            let game = new Game(number)
            console.log('new-game ' + game.number);
            data.gameList.push(game)
            socket.join(game.id)
            socket.emit('new-game-joined', game)
            socket.broadcast.emit('new-game-created', game)
        })

        socket.on('join-game-requested', function(gameId) {
            let game = data.gameList.find((game) => game.id === gameId)
            game.join()
            console.log('join-game ' + game.number);
            socket.join(game.id)
            socket.emit('game-joined', game)
            socket.broadcast.emit('game-full', game)
            socket.to(game).emit('other-player-joined')
        })

        socket.on('disconnecting', function () {
            console.log('disconnect')
            let rooms = socket.rooms
            rooms.forEach(function (room) {
                let gameIndex = data.gameList.findIndex((game) => game.id === room)
                if (gameIndex !== -1) {
                    console.log('user disconnected from game : ' + id)
                    data.gameList.splice(gameIndex, 1)
                }
            })
        })
    })
}
