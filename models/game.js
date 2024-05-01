const uniqid = require("uniqid")
const BoardGame = require("./boardGame")

class Game {
    constructor(number = 1) {
        this.id = uniqid()
        this.number = number
        this.playerList = []
        this.activePlayerList = []
        this.firstPlayerIndex = Math.floor(Math.random() * 2)
        this.boardGame = new BoardGame()
    }

    join(user) {
        this.playerList.push(user)
        this.activePlayerList.push(user)
    }

    quit(user) {
        let userIndex = this.activePlayerList.findIndex((player) => player.id === user.id)
        this.activePlayerList.splice(userIndex, 1)
    }
}

module.exports = Game
