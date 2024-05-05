const uniqid = require("uniqid")
const BoardGame = require("./boardGame")

class Game {
    constructor(number = 1) {
        this.id = uniqid()
        this.number = number
        this.playerList = []
        this.activePlayerList = []
        this.firstPlayer = null
        this.turnPlayer = null
        this.turnPlayerIndex = null
        this.boardGame = new BoardGame(3, 4)
    }

    join(user) {
        this.playerList.push(user)
        this.activePlayerList.push(user)
    }

    quit(user) {
        let userIndex = this.activePlayerList.findIndex((player) => player.id === user.id)
        this.activePlayerList.splice(userIndex, 1)
    }

    start() {
        this.turnPlayerIndex = Math.floor(Math.random() * 2)
        this.turnPlayer = this.firstPlayer = this.playerList[this.turnPlayerIndex]
        return this.firstPlayer
    }

    endTurn() {
        this.turnPlayerIndex = this.turnPlayerIndex === 0 ? 1 : 0
        this.turnPlayer = this.playerList[this.turnPlayerIndex]
    }
}

module.exports = Game
