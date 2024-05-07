class Piece {
    constructor(id, type, player, promoted) {
        this.id = id
        this.type = type
        this.player = player
        this.promoted = promoted

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

        this.moves = this.promoted ? this.promotedMoves : this.basicMoves
    }

    hasPromotion() {
        return this.promotedMoves.length > 0
    }

    canBePromoted() {
        return !this.promoted && this.promotedMoves.length > 0
    }

    promote() {
        this.promoted = true
        this.moves = this.promotedMoves
    }
}

module.exports = Piece
