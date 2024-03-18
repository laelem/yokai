class Piece {
    constructor(id, type, opponent, promoted, x, y) {
        this.id = id
        this.type = type
        this.opponent = opponent
        this.promoted = promoted
        this.x = x
        this.y = y

        switch (this.type) {
            case 'koropokkuru':
                this.color = '#ea1515'
                this.moves = ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left']
                this.promotedMoves = []
                break
            case 'kitsune':
                this.color = 'green'
                this.moves = ['top-right', 'top-left', 'bottom-right', 'bottom-left']
                this.promotedMoves = []
                break
            case 'tanuki':
                this.color = 'brown'
                this.moves = ['top', 'bottom', 'left', 'right']
                this.promotedMoves = []
                break
            case 'kodama':
                this.color = 'purple'
                this.moves = ['top']
                this.promotedMoves = ['top', 'bottom', 'left', 'right', 'top-right', 'top-left']
                break
        }

    }
}

module.exports = Piece
