const socket = io()

// Premier utilisateur connecté : affichage direct du plateau de jeu de la première partie
socket.on('first-user-connected', (game) => {
    console.log('first-user-connected')
    document.querySelectorAll('.piece.' + game.player2Id).forEach((piece) => {
        piece.remove()
    })
    document.querySelector('#board-game-container').style.display = 'block'
})

// Connexion d'un utilisateur : affichage des parties disponibles
socket.on('user-connected', (gameList) => {
    console.log('user-connected')
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
    console.log('new-game-joined: ' + game.number)
    document.querySelectorAll('.piece.' + game.player2Id).forEach((piece) => {
        piece.remove()
    })
    document.querySelector('#choose-game').style.display = 'none'
    document.querySelector('#board-game-container').style.display = 'block'
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
socket.on('game-joined', (game) => {
    console.log('game-joined: ' + game.number)
    document.querySelectorAll('.piece.' + game.player1Id).forEach((piece) => {
        piece.remove()
    })
    document.querySelector('#choose-game').style.display = 'none'
    document.querySelector('#board-game-container').style.display = 'block'
})

// Partie pleine, retrait de la partie dans la liste des parties disponibles
socket.on('game-full', (game) => {
    console.log('game-full: ' + game.number)
    document.querySelector('button.join[data-gameId="' + game.id + '"]').remove()
})

// Un utilisateur rejoint ma partie : la partie peut commencer
socket.on('other-player-joined', (game) => {
    console.log('other-player-joined: ' + game.number)
})




// Sélection d'une pièce sur le plateau de jeu
document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', (e) => {
        document.querySelectorAll('.piece').forEach((other) => other.classList.remove('selected'))
        e.target.classList.add('selected')
    })
})
