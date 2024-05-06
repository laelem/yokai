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

function movePiece(piece, x, y)
{
    const lastPiece = document.querySelector('.piece.last-played')
    if (lastPiece) {
        lastPiece.classList.remove('last-played')
    }
    piece.classList.add('last-played')

    const currentCell = piece.closest('.cell')

    const lastCell = document.querySelector('.cell.last-position')
    if (lastCell) {
        lastCell.classList.remove('last-position')
    }

    if (currentCell) {
        currentCell.classList.add('last-position')
    }

    const cell = document.querySelector('.cell[data-x="' + x + '"][data-y="' + y + '"]')
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

// Mouvement d'une pièce du joueur
socket.on('move-played', (pieceId, x, y) => {
    console.log('move-played', pieceId, x, y)

    const piece = document.getElementById(pieceId)

    // si la pièce vient de la réserve, on l'agrandit avant parachutage
    if (!piece.closest('.cell')) {
        const tileSize = piece.getAttribute('width')
        piece.setAttribute('width', (tileSize * 1.25).toString())
        piece.setAttribute('height', (tileSize * 1.25).toString())
        piece.classList.remove('col')
    }

    this.movePiece(piece, x, y)
    this.unselect(piece)

    // On enregistre la fin de tour
    const main = document.querySelector('#main-container')
    main.setAttribute('data-turn', main.getAttribute('data-turn') === 'p1' ? 'p2' : 'p1')

    // Affichage des messages de notification
    this.notifyPlayerEndTurn(piece, x, y)
})

// Mouvement d'une pièce de son adversaire
socket.on('opponent-move-played', (pieceId, x, y) => {
    console.log('opponent-move-played', pieceId, x, y)

    const piece = document.getElementById(pieceId)
    this.movePiece(piece, x, y)

    // On enregistre la fin de tour
    const main = document.querySelector('#main-container')
    main.setAttribute('data-turn', main.getAttribute('data-turn') === 'p1' ? 'p2' : 'p1')

    // Affichage des messages de notification
    this.notifyOpponentEndTurn(piece, x, y)
})

// Capture d'une pièce par un joueur
socket.on('capture-played', (side, pieceId, targetedPieceId) => {
    console.log('capture-played', pieceId, targetedPieceId)

    const main = document.querySelector('#main-container')
    const player = main.getAttribute('data-turn')

    const piece = document.getElementById(pieceId)
    const targetedPiece = document.getElementById(targetedPieceId)
    const targetedCell = targetedPiece.closest('.cell')
    const xDest = targetedCell.getAttribute('data-x')
    const yDest = targetedCell.getAttribute('data-y')

    this.movePiece(piece, xDest, yDest)
    this.unselect(piece)

    // on place la pièce capturée dans la réserve
    targetedPiece.setAttribute('data-is-promoted', '0')
    targetedPiece.setAttribute('data-side', side)
    targetedPiece.setAttribute('data-player', player)

    // on rétrécit sa taille
    const tileSize = targetedPiece.getAttribute('width')
    targetedPiece.setAttribute('width', (tileSize * 0.75).toString())
    targetedPiece.setAttribute('height', (tileSize * 0.75).toString())
    targetedPiece.classList.add('col')

    document.querySelector('.stock.' + side + ' .row').appendChild(targetedPiece)

    // On enregistre la fin de tour
    main.setAttribute('data-turn', player === 'p1' ? 'p2' : 'p1')

    // Affichage des messages de notification
    if (side === 'player') {
        this.notifyPlayerEndTurn(piece, xDest, yDest)
    } else {
        this.notifyOpponentEndTurn(piece, xDest, yDest)
    }
})