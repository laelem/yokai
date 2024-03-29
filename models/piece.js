class Piece {
    constructor(id, type, player, promoted, x, y) {
        this.id = id
        this.type = type
        this.player = player
        this.promoted = promoted
        this.x = x
        this.y = y

        switch (this.type) {
            case 'koropokkuru':
                this.moves = ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left']
                this.promotedMoves = []
                break
            case 'kitsune':
                this.moves = ['top-right', 'top-left', 'bottom-right', 'bottom-left']
                this.promotedMoves = []
                break
            case 'tanuki':
                this.moves = ['top', 'bottom', 'left', 'right']
                this.promotedMoves = []
                break
            case 'kodama':
                this.moves = ['top']
                this.promotedMoves = ['top', 'bottom', 'left', 'right', 'top-right', 'top-left']
                break
        }
    }
}

module.exports = Piece
