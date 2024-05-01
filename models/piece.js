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
                this.basicMoves = ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left']
                this.promotedMoves = []
                break
            case 'kitsune':
                this.basicMoves = ['top-right', 'top-left', 'bottom-right', 'bottom-left']
                this.promotedMoves = []
                break
            case 'tanuki':
                this.basicMoves = ['top', 'bottom', 'left', 'right']
                this.promotedMoves = []
                break
            case 'kodama':
                this.basicMoves = ['top']
                this.promotedMoves = ['top', 'bottom', 'left', 'right', 'top-right', 'top-left']
                break
        }

        this.moves = this.promoted ? this.basicMoves : this.promotedMoves
    }

    promote() {
        this.promoted = true
        this.moves = this.promotedMoves
    }
}

module.exports = Piece
