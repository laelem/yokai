const User = require("../models/user");
const Game = require("../models/game");

let data = {
    'userList': [],
    'gameList': [],
}

let createNewUser = function () {
    // recherche d'un numéro d'utilisateur disponible
    let numberList = data.userList.map((user) => user.number)
    let number = 1
    while(numberList.includes(number)) { number++ }
    let user = new User(number)
    console.log('new user logged in : ' + user.pseudo);
    data.userList.push(user)
    return user
}

let createNewGame = function () {
    // recherche d'un numéro de partie disponible
    let numberList = data.gameList.map((game) => game.number)
    let number = 1
    while(numberList.includes(number)) { number++ }
    let game = new Game(number)
    console.log('new-game ' + game.number);
    data.gameList.push(game)
    return game
}

exports.start = (io) => {
    io.on('connection', (socket) => {
        let currentUser = createNewUser()
        socket.emit('user-connected', currentUser)

        let availableGameList = data.gameList.filter(function (game) { return game.playerList.length === 1 })
        if (availableGameList.length > 0) {
            socket.emit('games-available', availableGameList)
        } else {
            let game = createNewGame()
            game.join(currentUser)
            socket.join(game.id)
            socket.emit('new-game-joined', game)
            socket.broadcast.emit('new-game-created', game)
        }

        socket.on('new-game-requested', function() {
            let game = createNewGame()
            game.join(currentUser)
            socket.join(game.id)
            socket.emit('new-game-joined', game)
            socket.broadcast.emit('new-game-created', game)
        })

        socket.on('join-game-requested', function(gameId) {
            let game = data.gameList.find((game) => game.id === gameId)
            game.join(currentUser)
            console.log('join-game ' + game.number);
            socket.join(game.id)
            socket.emit('game-joined', game.playerList[0], currentUser === game.playerList[game.firstPlayerIndex])
            socket.broadcast.emit('game-full', game)
            socket.to(game.id).emit('other-player-joined', currentUser, currentUser !== game.playerList[game.firstPlayerIndex])
        })

        socket.on('disconnecting', function () {
            console.log('disconnecting user ' + currentUser.pseudo)

            // suppression de l'utilisateur
            let userIndex = data.userList.findIndex((user) => user.id === currentUser.id)
            data.userList.splice(userIndex, 1)

            // recherche de ses parties en cours
            let rooms = socket.rooms
            rooms.forEach(function (room) {
                let game = data.gameList.find((game) => game.id === room)
                if (!game) { return } // il s'agit de la room par défaut de l'utilisateur
                game.quit(currentUser)
                console.log('user disconnected from game : ' + room)

                // suppression de la partie
                let gameIndex = data.gameList.findIndex((game) => game.id === room)
                data.gameList.splice(gameIndex, 1)

                // on prévient le potentiel joueur restant que son adversaire est parti
                if (game.activePlayerList.length === 1) {
                    socket.to(game.id).emit('game-over', 'other-player-left', currentUser)
                }
            })
        })
    })
}
