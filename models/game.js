class Game {
    constructor(number = 1) {
        this.number = number
        this.player1Id = 'p1'
        this.player2Id = 'p2'
        this.playerList = [this.player1Id]
        this.room = 'game' + number
    }
}

module.exports = Game
