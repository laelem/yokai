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
socket.on('user-connect', (player, opponent) => {
    console.log(player, opponent)
    document.querySelectorAll('.piece.' + opponent).forEach((piece) => {
        piece.remove()
    });
});

document.querySelectorAll('.piece').forEach((piece) => {
    piece.addEventListener('click', (e) => {
        document.querySelectorAll('.piece').forEach((other) => other.classList.remove('selected'))
        e.currentTarget.classList.add('selected')
    });
});