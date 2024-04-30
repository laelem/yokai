const uniqid = require("uniqid");

class Game {
    constructor(number = 1) {
        this.id = uniqid()
        this.number = number
        this.playerList = []
        this.firstPlayerIndex = Math.floor(Math.random() * 2)
    }

    join(user) {
        this.playerList.push(user)
    }
}

module.exports = Game
