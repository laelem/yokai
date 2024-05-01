const socket = io()

function displayBoard(game) {
    document.querySelector('#choose-game').style.display = 'none'
    document.querySelector('#game-number .number').textContent = game.number
    document.querySelector('#game-number').style.display = 'block'
    document.querySelector('#leave-game').style.display = 'block'
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
document.querySelector('#new-game').addEventListener('click', (e) => {
    console.log('new-game-requested')
    socket.emit('new-game-requested')
})

// Un utilisateur rejoint une nouvelle partie : affichage du plateau
socket.on('new-game-joined', (game) => {
    document.querySelectorAll('.piece.p2').forEach((piece) => {
        piece.remove()
    })
    document.querySelector('#news .waiting-user').style.display = 'block'
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
    document.querySelectorAll('.piece.p1').forEach((piece) => {
        piece.remove()
    })
    document.querySelector('#news .opponent .player').textContent = opponent.pseudo
    document.querySelector('#news .opponent').style.display = 'block'
    document.querySelector('#news ' + (amIFirstPlayer ? '.i-start' : '.other-start')).style.display = 'block'
    if (!amIFirstPlayer) {
        document.querySelector('#news .thinking .player').textContent = opponent.pseudo
        document.querySelector('#news .thinking').style.display = 'block'
    }
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
    document.querySelector('#news .user-arrived .player').textContent = opponent.pseudo
    document.querySelector('#news .user-arrived').style.display = 'block'
    document.querySelector('#news ' + (firstPlayer ? '.i-start' : '.other-start')).style.display = 'block'
    if (!firstPlayer) {
        document.querySelector('#news .thinking .player').textContent = opponent.pseudo
        document.querySelector('#news .thinking').style.display = 'block'
    }
})

// Fin de partie (gagné, perdu ou l'autre joueur s'est déconnecté) : on affiche une modal
socket.on('game-over', (why, user) => {
    const gameOverModal = new bootstrap.Modal('#game-over-modal')
    if (why === 'other-player-left') {
        console.log('other-player-left : ' + user.pseudo)
        document.querySelector('#news .other-player-left').style.display = 'block'
        document.querySelector('#game-over-modal .other-player-left').style.display = 'block'
    }
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

// Sélection d'une pièce sur le plateau de jeu
document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', (e) => {
        document.querySelectorAll('.piece').forEach((other) => other.classList.remove('selected'))
        e.target.classList.add('selected')
    })
})
