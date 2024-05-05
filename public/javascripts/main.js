const socket = io()

function displayBoard(game) {
    document.querySelector('#choose-game').style.display = 'none'
    document.querySelector('#game-number .number').textContent = game.number
    document.querySelector('#game-number').style.display = 'block'
    document.querySelector('#leave-game').style.display = 'block'
    document.querySelector('#main-container').setAttribute('data-game-id', game.id)
    document.querySelector('#main-container').style.display = 'flex'
}

// Connexion d'un nouvel utilisateur
socket.on('user-connected', (user) => {
    console.log('user connected : ' + user.pseudo)
    document.querySelector('#user-panel .pseudo').textContent = user.pseudo
})

// Affichage des parties disponibles à l'arrivée d'un nouvel utilisateur
socket.on('games-available', (gameList) => {
    console.log('games-available')
    let chooseGameElement = document.querySelector('#choose-game')

    gameList.forEach(function (game) {
        let button = document.querySelector('#join-button-template').cloneNode(true)
        button.removeAttribute('id')
        button.dataset.gameId = game.id
        button.querySelector('.number').textContent = game.number
        button.style.display = 'block'
        chooseGameElement.firstChild.appendChild(button)
    })

    chooseGameElement.style.display = 'block'
})

// Demande de création d'une nouvelle partie au serveur
document.querySelector('#new-game').addEventListener('click', () => {
    console.log('new-game-requested')
    socket.emit('new-game-requested')
})

// Un utilisateur rejoint une nouvelle partie : affichage du plateau
socket.on('new-game-joined', (game) => {
    // suppression du plateau en miroir
    document.querySelector('.board-game[data-player="p2"]').remove()

    // identification des pièces adverses
    document.querySelectorAll('.piece[data-player="p2"]').forEach((piece) => {
        piece.setAttribute('data-side', 'opponent')
    })

    // Affichage des messages de notification
    document.querySelector('#news .waiting-user').style.display = 'block'

    // affichage du plateau de jeu
    displayBoard(game)
})

// Nouvelle partie créée, affichage de la partie dans la liste des parties disponibles
socket.on('new-game-created', (game) => {
    console.log('new-game-created: ' + game.number)
    let button = document.querySelector('#join-button-template').cloneNode(true)
    button.removeAttribute('id')
    button.dataset.gameId = game.id
    button.querySelector('.number').textContent = game.number
    button.style.display = 'block'
    document.querySelector('#choose-game').firstChild.appendChild(button)
})

// Demande pour rejoindre une partie existante
document.querySelector('#choose-game').addEventListener('click', (e) => {
    if (e.target.classList.contains('join')) {
        let gameId = e.target.dataset.gameId
        console.log('join-game-requested : ' + gameId)
        socket.emit('join-game-requested', gameId)
    }
})

// Un utilisateur rejoint une partie existante : affichage du plateau
socket.on('game-joined', (game, opponent, amIFirstPlayer) => {
    // suppression du plateau en miroir
    document.querySelector('.board-game[data-player="p1"]').remove()

    // identification des pièces adverses
    document.querySelectorAll('.piece[data-player="p1"]').forEach((piece) => {
        piece.setAttribute('data-side', 'opponent')
    })

    // Affichage des messages de notification
    document.querySelectorAll('#news .opponent').forEach((opponentPseudoNode) => {
        opponentPseudoNode.textContent = opponent.pseudo
    })
    document.querySelector('#news .opponent-identity').style.display = 'block'
    document.querySelector('#news ' + (amIFirstPlayer ? '.i-start' : '.other-start')).style.display = 'block'
    if (!amIFirstPlayer) {
        document.querySelector('#news .thinking').style.display = 'block'
    }

    // affichage du plateau de jeu
    displayBoard(game)
})

// Partie pleine, retrait de la partie dans la liste des parties disponibles
socket.on('game-full', (game) => {
    console.log('game-full: ' + game.number)
    document.querySelectorAll('button.join').forEach((button) => {
        if (button.getAttribute('data-game-id') === game.id) {
            button.remove()
        }
    })
})

// Un utilisateur rejoint ma partie : la partie peut commencer
socket.on('other-player-joined', (opponent, firstPlayer) => {
    console.log('other-player-joined: ' + opponent.pseudo)
    document.querySelector('#news .waiting-user').style.display = 'none'
    document.querySelectorAll('#news .opponent').forEach((opponentPseudoNode) => {
        opponentPseudoNode.textContent = opponent.pseudo
    })
    document.querySelector('#news .user-arrived').style.display = 'block'
    document.querySelector('#news ' + (firstPlayer ? '.i-start' : '.other-start')).style.display = 'block'
    if (!firstPlayer) {
        document.querySelector('#news .thinking').style.display = 'block'
    }
})

// Fin de partie (gagné, perdu ou l'autre joueur s'est déconnecté) : on affiche une modal
socket.on('game-over', (why, opponent) => {
    const gameOverModal = new bootstrap.Modal('#game-over-modal')
    document.querySelector('#news .thinking').style.display = 'none'
    document.querySelector('#news .' + why).style.display = 'block'
    document.querySelector('#game-over-modal .' + why).style.display = 'block'
    gameOverModal.show()
})

// Partie supprimée : retrait de la liste des parties disponibles
socket.on('game-deleted', (game) => {
    console.log('game-deleted: ' + game.number)
    document.querySelectorAll('button.join').forEach((button) => {
        if (button.getAttribute('data-game-id') === game.id) {
            button.remove()
        }
    })
})

// Sélection d'une pièce
document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', (e) => {
        const currentPiece = e.currentTarget
        const currentCell = currentPiece.closest('.cell')
        const x = parseInt(currentCell.getAttribute('data-x'))
        const y = parseInt(currentCell.getAttribute('data-y'))
        const isPromoted = (currentPiece.getAttribute('data-is-promoted') === '1')
        const selectedPiece = document.querySelector('.piece[data-selected="1"]')

        // le joueur sélectionne une de ses pièces
        if (currentPiece.getAttribute("data-side") === 'player') {
            // une pièce était déjà sélectionnée : on enlève sa surbrillance et la surbrillance des mouvements autorisés
            if (selectedPiece) {
                selectedPiece.setAttribute("data-selected", "0")
                document.querySelectorAll('.cell').forEach((cell) => {
                    cell.classList.remove('move-allowed')
                })
                document.querySelectorAll('.piece').forEach((piece) => {
                    piece.classList.remove('capture-allowed')
                })
            }

            // si la pièce est la même, on ne fait rien
            if (selectedPiece === currentPiece) {
                return
            }

            // si elle est différente, on la met en surbrillance
            currentPiece.setAttribute('data-selected', '1')

            // Mise en surbrillance des cases autorisées pour un mouvement
            let xMove, yMove, cell, piece
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
        }

        // le joueur sélectionne une pièce adverse
        if (currentPiece.getAttribute("data-side") !== 'player') {
            // si aucune pièce n'était préalablement sélectionné ou si la pièce adverse n'est pas capturable
            if (!selectedPiece || !currentPiece.classList.contains('capture-allowed')) {
                return
            }

            // envoi du coup au serveur
            const gameId = document.querySelector('#main-container').getAttribute('data-game-id')
            socket.emit('capture-requested', gameId, selectedPiece.id, currentPiece.id)
        }
    })
})

// Sélection d'une case
document.querySelectorAll('.cell').forEach((cell) => {
    cell.addEventListener('click', (e) => {
        const currentCell = e.currentTarget
        const currentPiece = currentCell.querySelector('.piece')
        const selectedPiece = document.querySelector('.piece[data-selected="1"]')

        // si la case contient une pièce, le fonctionnement est déjà géré
        // si aucune pièce n'est sélectionné, il n'y a rien à faire
        // si la case n'est pas un mouvement autorisé, il n'y a rien à faire
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

function movepiece(pieceId, x, y)
{
    const piece = document.getElementById(pieceId)

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
    currentCell.classList.add('last-position')

    const cell = document.querySelector('.cell[data-x="' + x + '"][data-y="' + y + '"]')
    cell.appendChild(piece)
}

// Mouvement d'une pièce du joueur
socket.on('move-played', (pieceId, x, y) => {
    console.log('move-played', pieceId, x, y)

    this.movepiece(pieceId, x, y)

    // on enlève la surbrillance des mouvements autorisés
    piece.setAttribute("data-selected", "0")
    document.querySelectorAll('.cell').forEach((cell) => {
        cell.classList.remove('move-allowed')
    })
    document.querySelectorAll('.piece').forEach((piece) => {
        piece.classList.remove('capture-allowed')
    })

    // Affichage des messages de notification
    const newsNode = document.querySelector('#news')

    const yourTurnNode = newsNode.querySelector('.your-turn')
    yourTurnNode.style.display = 'none'

    const shotNode = newsNode.querySelector('.shot-template').cloneNode(true)
    shotNode.classList.remove('shot-template')
    shotNode.classList.add('shot')
    shotNode.querySelector('.piece-type').textContent = piece.getAttribute('data-type')
    shotNode.querySelector('.coords').textContent = '(' + x + ';' + y + ')'
    newsNode.appendChild(shotNode)
    shotNode.style.display = 'block'

    const thinkingNode = newsNode.querySelector('.thinking')
    newsNode.appendChild(thinkingNode)
    thinkingNode.style.display = 'block'
})

// Mouvement d'une pièce de son adversaire
socket.on('opponent-move-played', (pieceId, x, y) => {
    console.log('opponent-move-played', pieceId, x, y)

    this.movepiece(pieceId, x, y)

    // Affichage des messages de notification
    const newsNode = document.querySelector('#news')

    const thinkingNode = newsNode.querySelector('.thinking')
    thinkingNode.style.display = 'none'

    const opponentShotNode = newsNode.querySelector('.opponent-shot-template').cloneNode(true)
    opponentShotNode.classList.remove('opponent-shot-template')
    opponentShotNode.classList.add('opponent-shot')
    opponentShotNode.querySelector('.piece-type').textContent = piece.getAttribute('data-type')
    opponentShotNode.querySelector('.coords').textContent = '(' + x + ';' + y + ')'
    newsNode.appendChild(opponentShotNode)
    opponentShotNode.style.display = 'block'

    const yourTurnNode = newsNode.querySelector('.your-turn')
    newsNode.appendChild(yourTurnNode)
    yourTurnNode.style.display = 'block'
})

// Capture d'une pièce par le joueur
socket.on('captured-played', (pieceId, targetedPieceId) => {
    console.log('captured-played', pieceId, targetedPieceId)

    const targetedPiece = document.getElementById(targetedPieceId)
    const targetedCell = targetedPiece.closest('.cell')

    this.movepiece(pieceId, targetedCell.getAttribute('data-x'), targetedCell.getAttribute('data-y'))

    // on enlève la surbrillance des mouvements autorisés
    piece.setAttribute("data-selected", "0")
    document.querySelectorAll('.cell').forEach((cell) => {
        cell.classList.remove('move-allowed')
    })
    document.querySelectorAll('.piece').forEach((piece) => {
        piece.classList.remove('capture-allowed')
    })

    // Affichage des messages de notification
    const newsNode = document.querySelector('#news')

    const yourTurnNode = newsNode.querySelector('.your-turn')
    yourTurnNode.style.display = 'none'

    const shotNode = newsNode.querySelector('.shot-template').cloneNode(true)
    shotNode.classList.remove('shot-template')
    shotNode.classList.add('shot')
    shotNode.querySelector('.piece-type').textContent = piece.getAttribute('data-type')
    shotNode.querySelector('.coords').textContent = '(' + x + ';' + y + ')'
    newsNode.appendChild(shotNode)
    shotNode.style.display = 'block'

    const thinkingNode = newsNode.querySelector('.thinking')
    newsNode.appendChild(thinkingNode)
    thinkingNode.style.display = 'block'
})