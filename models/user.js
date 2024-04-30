const uniqid = require("uniqid");

class User {
    constructor(number = 1) {
        this.id = uniqid()
        this.number = number
        this.pseudo = 'Player_' + number
    }
}

module.exports = User
