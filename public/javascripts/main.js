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

    // Insertion des propriétés du jeu
    const main = document.querySelector('#main-container')
    main.setAttribute('data-player', 'p2')
    main.setAttribute('data-turn', amIFirstPlayer ? 'p2' : 'p1')

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
socket.on('other-player-joined', (opponent, amIFirstPlayer) => {
    // Insertion des propriétés du jeu
    const main = document.querySelector('#main-container')
    main.setAttribute('data-player', 'p1')
    main.setAttribute('data-turn', amIFirstPlayer ? 'p1' : 'p2')

    // affichage des messages de notification
    document.querySelector('#news .waiting-user').style.display = 'none'
    document.querySelectorAll('#news .opponent').forEach((opponentPseudoNode) => {
        opponentPseudoNode.textContent = opponent.pseudo
    })
    document.querySelector('#news .user-arrived').style.display = 'block'
    document.querySelector('#news ' + (amIFirstPlayer ? '.i-start' : '.other-start')).style.display = 'block'
    if (!amIFirstPlayer) {
        document.querySelector('#news .thinking').style.display = 'block'
    }
})

// Fin de partie (gagné, perdu ou l'autre joueur s'est déconnecté)
socket.on('game-over', (why, opponent) => {
    // On enregistre la fin de tour
    document.querySelector('#main-container').removeAttribute('data-turn')

    // on affiche une modal
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
