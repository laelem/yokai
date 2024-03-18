const express = require('express');
const BoardGame = require("../public/javascripts/boardGame");
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  const boardGame = new BoardGame()
  res.render('game', {
    title: 'Yokai no mori',
    xNbTile: 3,
    yNbTile: 4,
    tileSize: 150,
    boardGame: boardGame
  });
});

module.exports = router;
