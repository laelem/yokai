const Piece = require("./piece");

class BoardGame {
    constructor(xNbCell, yNbCell) {
        this.xNbCell = xNbCell
        this.yNbCell = yNbCell

        this.cells = []
        for (let y=0; y<yNbCell; y++) {
            this.cells[y] = []
            for (let x=0; x<xNbCell; x++) {
                this.cells[y][x] = null
            }
        }

        this.cells[3][1] = new Piece('koropokkuru-1', 'koropokkuru', 'p1', false)
        this.cells[3][0] = new Piece('kitsune-1', 'kitsune', 'p1', false)
        this.cells[3][2] = new Piece('tanuki-1', 'tanuki', 'p1', false)
        this.cells[2][1] = new Piece('kodama-1', 'kodama', 'p1', true)
        this.cells[0][1] = new Piece('koropokkuru-2', 'koropokkuru', 'p2', false)
        this.cells[0][2] = new Piece('kitsune-2', 'kitsune', 'p2', false)
        this.cells[0][0] = new Piece('tanuki-2', 'tanuki', 'p2', false)
        this.cells[1][1] = new Piece('kodama-2', 'kodama', 'p2', false)

        this.stock = {
            'p1': {'kodama': [], 'tanuki': [], 'kitsune': []},
            'p2': {'kodama': [], 'tanuki': [], 'kitsune': []},
        }
    }

    coordsToMoveId(x, y) {
        switch (y) {
            case -1:
                if (x === -1) return 'top-left'
                if (x === 0) return 'top'
                if (x === 1) return 'top-right'
                return null
            case 0:
                if (x === -1) return 'left'
                if (x === 1) return 'right'
                return null
            case 1:
                if (x === -1) return 'bottom-left'
                if (x === 0) return 'bottom'
                if (x === 1) return 'bottom-right'
                return null
        }
        return null
    }

    move(player, pieceId, xDest, yDest) {
        const yStart = this.cells.findIndex((row) => row.find((piece) => piece && piece.id === pieceId))

        if (
            // si la pièce est introuvable
            yStart === -1
            // ou si la case de destination n'existe pas
            || typeof this.cells[yDest] === 'undefined' || typeof this.cells[yDest][xDest] === 'undefined'
            // ou si la case de destination n'est pas vide
            || this.cells[yDest][xDest] !== null
        ) {
            return false
        }

        const xStart = this.cells[yStart].findIndex((piece) => piece && piece.id === pieceId)
        const piece = this.cells[yStart][xStart]

        // si la pièce n'appartient pas au joueur
        if (piece.player !== player) {
            return false
        }

        let xMove = xDest - xStart
        let yMove = yDest - yStart
        if (piece.player === 'p2') {
            xMove = xMove * (-1)
            yMove = yMove * (-1)
        }

        // si le mouvement n'est pas autorisé pour ce type de pièce
        if (!piece.moves.includes(this.coordsToMoveId(xMove, yMove))) {
            return false
        }

        this.cells[yStart][xStart] = null
        this.cells[yDest][xDest] = piece

        return true
    }

    capture(player, pieceId, targetedPieceId) {
        console.log('capture')
        console.log(pieceId)
        console.log(targetedPieceId)
        const yStart = this.cells.findIndex((row) => row.find((piece) => piece && piece.id === pieceId))
        const yDest = this.cells.findIndex((row) => row.find((piece) => piece && piece.id === targetedPieceId))

        // si la pièce ou la pièce ciblée est introuvable
        if (yStart === -1 || yDest === -1) {
            return false
        }

        const xStart = this.cells[yStart].findIndex((piece) => piece && piece.id === pieceId)
        const xDest = this.cells[yDest].findIndex((piece) => piece && piece.id === targetedPieceId)

        const piece = this.cells[yStart][xStart]
        const targetedPiece = this.cells[yDest][xDest]

        // si la pièce n'appartient pas au joueur
        // ou si la pièce ciblée n'appartient pas à son adversaire
        if (piece.player !== player || targetedPiece.player === player) {
            return false
        }

        let xMove = xDest - xStart
        let yMove = yDest - yStart
        if (piece.player === 'p2') {
            xMove = xMove * (-1)
            yMove = yMove * (-1)
        }

        // si le mouvement n'est pas autorisé pour ce type de pièce
        if (!piece.moves.includes(this.coordsToMoveId(xMove, yMove))) {
            return false
        }

        this.cells[yStart][xStart] = null
        this.cells[yDest][xDest] = piece
        this.stock[player][targetedPiece.type].push(targetedPiece)

        console.log(this.stock)

        return true
    }
}

module.exports = BoardGame
