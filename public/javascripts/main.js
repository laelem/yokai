const socket = io();

//
// let counter = 0;
//
// const socket = io({
//     auth: {
//         serverOffset: 0
//     },
//     // enable retries
//     ackTimeout: 10000,
//     retries: 3,
// });
//
// const form = document.getElementById('form');
// const input = document.getElementById('input');
// const messages = document.getElementById('messages');
//
// form.addEventListener('submit', (e) => {
//     e.preventDefault();
//     if (input.value) {
//         // compute a unique offset
//         const clientOffset = `${socket.id}-${counter++}`;
//         socket.emit('chat message', input.value, clientOffset);
//         input.value = '';
//     }
// });
//
socket.on('welcome', (gameList) => {
    console.log('welcome')
    let chooseGameElement = document.getElementById('choose-game')

    gameList.forEach(function (game) {
        let test = document.getElementById('join-button-template')
        console.log(test)
        let button = test.cloneNode(true)
        button.removeAttribute('id')
        button.querySelector('.number').textContent = game.number
        button.style.display = 'block'
        chooseGameElement.firstChild.appendChild(button)
    })

    chooseGameElement.style.display = 'block'
});

socket.on('new-game', (game) => {
    console.log('new-game')
    document.querySelectorAll('.piece.' + game.player2Id).forEach((piece) => {
        piece.remove()
    });
    document.getElementById('board-game-container').style.display = 'block'
});

document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', (e) => {
        document.querySelectorAll('.piece').forEach((other) => other.classList.remove('selected'))
        e.currentTarget.classList.add('selected')
    });
});