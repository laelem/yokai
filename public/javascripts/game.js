function unselect(selectedPiece)
{
    selectedPiece.setAttribute("data-selected", "0")

    document.querySelectorAll('.cell').forEach((cell) => {
        cell.classList.remove('move-allowed')
    })

    document.querySelectorAll('.piece').forEach((piece) => {
        piece.classList.remove('capture-allowed')
    })
}

function movePiece(player, piece, x, y)
{
    const lastPiece = document.querySelector('.piece.last-played')
    if (lastPiece) {
        lastPiece.classList.remove('last-played')
    }
    piece.classList.add('last-played')

    const currentCell = piece.closest('.cell')
    const cell = document.querySelector('.cell[data-x="' + x + '"][data-y="' + y + '"]')

    const lastCell = document.querySelector('.cell.last-position')
    if (lastCell) {
        lastCell.classList.remove('last-position')
    }

    if (currentCell) {
        currentCell.classList.add('last-position')
    }

    // si la pièce vient de la réserve
    if (!currentCell) {
        const stock = piece.closest('.stock')

        // on l'agrandit avant parachutage
        const tileSize = piece.getAttribute('width')
        piece.setAttribute('width', (tileSize * (4/3)).toString())
        piece.setAttribute('height', (tileSize * (4/3)).toString())
        piece.classList.remove('col')

        piece.querySelector('.number-icon').style.display = 'none'
        piece.querySelector('.number-text').style.display = 'none'
        cell.appendChild(piece)

        // on recalcule le nombre de pièces du même type restant en réserve
        const pieceType = piece.getAttribute('data-type')
        const piecesInStock = stock.querySelectorAll('.piece[data-type="' + pieceType + '"]')

        if (piecesInStock.length === 0) {
            return
        }

        if (piecesInStock.length === 1) {
            piecesInStock[0].querySelector('.number-icon').style.display = 'none'
            piecesInStock[0].querySelector('.number-text').style.display = 'none'
            piecesInStock[0].style.display = 'block'
            return
        }

        // si plus d'une pièce du même type reste en réserve
        const numberNode = targetedPiece.querySelector('.number-text')
        numberNode.textContent = piecesInStock.length.toString()
        piecesInStock[0].querySelector('.number-icon').style.display = 'block'
        piecesInStock[0].querySelector('.number-text').style.display = 'block'
        piecesInStock[0].style.display = 'block'
        return
    }

    // promotion éventuelle
    if (
        piece.classList.contains('has-promotion')
        && cell.classList.contains(player + '-promotion-zone')
    ) {
        piece.setAttribute('data-is-promoted', '1')
    }

    cell.appendChild(piece)
}

function notifyPlayerEndTurn(piece, xDest, yDest)
{
    const newsNode = document.querySelector('#news')

    const yourTurnNode = newsNode.querySelector('.your-turn')
    yourTurnNode.style.display = 'none'

    const shotNode = newsNode.querySelector('.shot-template').cloneNode(true)
    shotNode.classList.remove('shot-template')
    shotNode.classList.add('shot')
    shotNode.querySelector('.piece-type').textContent = piece.getAttribute('data-type')
    shotNode.querySelector('.coords').textContent = '(' + xDest + ';' + yDest + ')'
    newsNode.appendChild(shotNode)
    shotNode.style.display = 'block'

    const thinkingNode = newsNode.querySelector('.thinking')
    newsNode.appendChild(thinkingNode)
    thinkingNode.style.display = 'block'

    newsNode.scrollTop = newsNode.scrollHeight
}

function notifyOpponentEndTurn(piece, xDest, yDest)
{
    const newsNode = document.querySelector('#news')

    const thinkingNode = newsNode.querySelector('.thinking')
    thinkingNode.style.display = 'none'

    const opponentShotNode = newsNode.querySelector('.opponent-shot-template').cloneNode(true)
    opponentShotNode.classList.remove('opponent-shot-template')
    opponentShotNode.classList.add('opponent-shot')
    opponentShotNode.querySelector('.piece-type').textContent = piece.getAttribute('data-type')
    opponentShotNode.querySelector('.coords').textContent = '(' + xDest + ';' + yDest + ')'
    newsNode.appendChild(opponentShotNode)
    opponentShotNode.style.display = 'block'

    const yourTurnNode = newsNode.querySelector('.your-turn')
    newsNode.appendChild(yourTurnNode)
    yourTurnNode.style.display = 'block'

    newsNode.scrollTop = newsNode.scrollHeight
}

// Sélection d'une pièce
document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', (e) => {

        // Si ce n'est pas le tour du joueur
        const player = document.querySelector('#main-container').getAttribute('data-player')
        const turn = document.querySelector('#main-container').getAttribute('data-turn')
        if (!turn || turn !== player) {
            return
        }

        const currentPiece = e.currentTarget
        const currentCell = currentPiece.closest('.cell')
        const isPromoted = (currentPiece.getAttribute('data-is-promoted') === '1')
        const selectedPiece = document.querySelector('.piece[data-selected="1"]')

        // le joueur sélectionne une pièce adverse
        if (currentPiece.getAttribute("data-side") !== 'player') {
            // si aucune pièce n'était préalablement sélectionné ou si la pièce adverse n'est pas capturable
            if (!selectedPiece || !currentPiece.classList.contains('capture-allowed')) {
                return
            }

            // envoi du coup au serveur
            const gameId = document.querySelector('#main-container').getAttribute('data-game-id')
            socket.emit('capture-requested', gameId, selectedPiece.id, currentPiece.id)

            return
        }

        // le joueur sélectionne une de ses pièces :

        // une pièce était déjà sélectionnée : on enlève sa surbrillance et la surbrillance des mouvements autorisés
        if (selectedPiece) {
            this.unselect(selectedPiece)
        }

        // si la pièce est la même, on ne fait rien
        if (selectedPiece === currentPiece) {
            return
        }

        // si elle est différente, on la met en surbrillance
        currentPiece.setAttribute('data-selected', '1')

        // si la pièce n'est pas dans une case, il s'agit d'une pièce provenant de la réserve
        if (!currentCell) {
            // Mise en surbrillance des cases autorisées pour un parachutage
            document.querySelectorAll('.cell').forEach((cell) => {
                if(!cell.querySelector('.piece')) {
                    cell.classList.add('move-allowed')
                }
            })
            return
        }

        // Si la pièce est sur le plateau, on met en surbrillance les cases autorisées pour un mouvement
        let xMove, yMove, cell, piece
        const x = parseInt(currentCell.getAttribute('data-x'))
        const y = parseInt(currentCell.getAttribute('data-y'))
        currentPiece.querySelectorAll('.move[data-' + (isPromoted ? 'promoted' : 'basic') + '-enabled="1"]').forEach((move) => {
            xMove = x + parseInt(move.getAttribute('data-x'))
            yMove = y + parseInt(move.getAttribute('data-y'))
            cell = document.querySelector('.cell[data-x="' + xMove + '"][data-y="' + yMove + '"]')

            if (cell) {
                piece = cell.querySelector('.piece')
                if (!piece) {
                    cell.classList.add('move-allowed')
                } else if (piece.getAttribute('data-side') !== 'player') {
                    cell.classList.add('move-allowed')
                    piece.classList.add('capture-allowed')
                }
            }
        })
    })
})

// Sélection d'une case
document.querySelectorAll('.cell').forEach((cell) => {
    cell.addEventListener('click', (e) => {
        const currentCell = e.currentTarget
        const currentPiece = currentCell.querySelector('.piece')
        const selectedPiece = document.querySelector('.piece[data-selected="1"]')

        // si la case contient une pièce => le fonctionnement est déjà géré
        // ou si aucune pièce n'a été préalablement sélectionnée
        // ou si la case n'est pas un mouvement autorisé
        if (currentPiece || !selectedPiece || !cell.classList.contains('move-allowed')) {
            return
        }

        // envoi du coup au serveur
        const gameId = document.querySelector('#main-container').getAttribute('data-game-id')
        const x = currentCell.getAttribute('data-x')
        const y = currentCell.getAttribute('data-y')
        socket.emit('move-requested', gameId, selectedPiece.id, x, y)
    })
})

// Mouvement d'une pièce par un joueur
socket.on('move-played', (side, pieceId, x, y) => {
    const main = document.querySelector('#main-container')
    const player = main.getAttribute('data-turn')
    const piece = document.getElementById(pieceId)

    this.movePiece(player, piece, x, y)
    this.unselect(piece)

    // On enregistre la fin de tour
    main.setAttribute('data-turn', player === 'p1' ? 'p2' : 'p1')

    // Affichage des messages de notification
    if (side === 'player') {
        this.notifyPlayerEndTurn(piece, x, y)
    } else {
        this.notifyOpponentEndTurn(piece, x, y)
    }
})

// Capture d'une pièce par un joueur
socket.on('capture-played', (side, pieceId, targetedPieceId) => {
    const main = document.querySelector('#main-container')
    const player = main.getAttribute('data-turn')

    const piece = document.getElementById(pieceId)
    const targetedPiece = document.getElementById(targetedPieceId)
    const pieceType = targetedPiece.getAttribute('data-type')
    const targetedCell = targetedPiece.closest('.cell')
    const xDest = targetedCell.getAttribute('data-x')
    const yDest = targetedCell.getAttribute('data-y')

    this.movePiece(player, piece, xDest, yDest)
    this.unselect(piece)

    // on capture la pièce
    targetedPiece.setAttribute('data-is-promoted', '0')
    targetedPiece.setAttribute('data-side', side)
    targetedPiece.setAttribute('data-player', player)

    // on rétrécit sa taille avant de la placer dans la réserve
    const tileSize = targetedPiece.getAttribute('width')
    targetedPiece.setAttribute('width', (tileSize * (3/4)).toString())
    targetedPiece.setAttribute('height', (tileSize * (3/4)).toString())
    targetedPiece.classList.add('col')

    const stock = document.querySelector('.stock.' + side + ' .row')
    const piecesInStock = stock.querySelectorAll('.piece[data-type="' + pieceType + '"]')
    if (piecesInStock.length === 0) {
        stock.appendChild(targetedPiece)
    } else {
        piecesInStock[0].style.display = 'none'
        const numberNode = targetedPiece.querySelector('.number-text')
        numberNode.textContent = (piecesInStock.length + 1).toString()
        numberNode.style.display = 'block'
        targetedPiece.querySelector('.number-icon').style.display = 'block'
        stock.insertBefore(targetedPiece, piecesInStock[0])
    }

    // On enregistre la fin de tour
    main.setAttribute('data-turn', player === 'p1' ? 'p2' : 'p1')

    // Affichage des messages de notification
    if (side === 'player') {
        this.notifyPlayerEndTurn(piece, xDest, yDest)
    } else {
        this.notifyOpponentEndTurn(piece, xDest, yDest)
    }
})