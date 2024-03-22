const uniqid = require("uniqid");

class Game {
    constructor(number = 1) {
        this.id = uniqid()
        this.number = number
        this.player1Id = 'p1'
        this.player2Id = 'p2'
        this.playerList = [this.player1Id]
    }

    join() {
        this.playerList.push(this.player2Id)
    }
}

module.exports = Game
