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
            const game = createNewGame()
            game.join(currentUser)
            socket.join(game.id)
            socket.emit('new-game-joined', game)
            socket.broadcast.emit('new-game-created', game)
        }

        socket.on('new-game-requested', function() {
            const game = createNewGame()
            game.join(currentUser)
            socket.join(game.id)
            socket.emit('new-game-joined', game)
            socket.broadcast.emit('new-game-created', game)
        })

        socket.on('join-game-requested', function(gameId) {
            const game = data.gameList.find((game) => game.id === gameId)
            game.join(currentUser)
            console.log('join-game ' + game.number);
            socket.join(game.id)
            game.start()
            const amIFirstPlayer = currentUser === game.firstPlayer
            socket.emit('game-joined', game, game.playerList[0], amIFirstPlayer)
            socket.broadcast.emit('game-full', game)
            socket.to(game.id).emit('other-player-joined', currentUser, !amIFirstPlayer)
        })

        socket.on('disconnecting', function () {
            console.log('disconnecting user ' + currentUser.pseudo)

            // suppression de l'utilisateur
            const userIndex = data.userList.findIndex((user) => user.id === currentUser.id)
            data.userList.splice(userIndex, 1)

            // recherche de ses parties en cours
            let rooms = socket.rooms
            rooms.forEach(function (room) {
                const game = data.gameList.find((game) => game.id === room)
                if (!game) { return } // il s'agit de la room par défaut de l'utilisateur
                game.quit(currentUser)
                console.log('user disconnected from game : ' + room)

                // suppression de la partie
                const gameIndex = data.gameList.findIndex((game) => game.id === room)
                data.gameList.splice(gameIndex, 1)

                // si la partie n'est pas terminée
                // on prévient le potentiel joueur restant que son adversaire est parti
                if (!game.winner && game.activePlayerList.length === 1) {
                    socket.to(game.id).emit('game-over', 'other-player-left', currentUser)
                }

                // on supprime la partie des parties disponibles
                socket.broadcast.emit('game-deleted', game)
            })
        })

        socket.on('move-requested', function (gameId, pieceId, x, y) {
            console.log('piece selected : ' + pieceId)

            const game = data.gameList.find((game) => game.id === gameId)

            if (currentUser !== game.turnPlayer) {
                return
            }

            const player = currentUser === game.playerList[0] ? 'p1' : 'p2'

            // Mise à jour du plateau de jeu si le coup est permis
            if (!game.boardGame.move(player, pieceId, x, y)) {
                return
            }

            game.endTurn()
            socket.emit('move-played', 'player', pieceId, x, y)
            socket.to(game.id).emit('move-played', 'opponent', pieceId, x, y)

            if (game.boardGame.koropokkuruPromoted === true) {
                game.winner = currentUser
                socket.emit('game-over', 'win')
                socket.to(game.id).emit('game-over', 'loose')
            }
        })

        socket.on('capture-requested', function (gameId, pieceId, targetedPieceId) {
            console.log('piece selected : ' + pieceId)
            console.log('piece targeted : ' + targetedPieceId)

            const game = data.gameList.find((game) => game.id === gameId)

            if (currentUser !== game.turnPlayer) {
                return
            }

            const player = currentUser === game.playerList[0] ? 'p1' : 'p2'

            // Mise à jour du plateau de jeu si le coup est permis
            if (!game.boardGame.capture(player, pieceId, targetedPieceId)) {
                return
            }

            game.endTurn()
            socket.emit('capture-played', 'player', pieceId, targetedPieceId)
            socket.to(game.id).emit('capture-played', 'opponent', pieceId, targetedPieceId)

            if (game.boardGame.koropokkuruPromoted === true || game.boardGame.koropokkuruCaptured === true) {
                game.winner = currentUser
                socket.emit('game-over', 'win')
                socket.to(game.id).emit('game-over', 'loose')
            }
        })
    })
}
