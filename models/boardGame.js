const Piece = require("./piece");

class BoardGame {
    constructor() {
        this.pieces = [
            new Piece('koropokkuru-1', 'koropokkuru', 'p1', false, 1, 3),
            new Piece('kitsune-1', 'kitsune', 'p1', false, 0, 3),
            new Piece('tanuki-1', 'tanuki', 'p1', false, 2, 3),
            new Piece('kodama-1', 'kodama', 'p1', true, 1, 2),
            new Piece('koropokkuru-2', 'koropokkuru', 'p2', false, 1, 0),
            new Piece('kitsune-2', 'kitsune', 'p2', false, 2, 0),
            new Piece('tanuki-2', 'tanuki', 'p2', false, 0, 0),
            new Piece('kodama-2', 'kodama', 'p2', false, 1, 1),
        ]
        this.state = {}
        this.display()
    }

    display() {
        for (let i=0; i<this.pieces.length; i++) {
            this.state['pos' + this.pieces[i].x + '_' + this.pieces[i].y] = this.pieces[i]
        }
    }
}

module.exports = BoardGame
