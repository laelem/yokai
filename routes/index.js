const express = require('express');
const BoardGame = require("../models/boardGame");
const router = express.Router();

router.get('/', function(req, res) {
  const boardGame = new BoardGame()
  res.render('index', {
    title: 'Yokai no mori',
    xNbTile: 3,
    yNbTile: 4,
    tileSize: 100,
    boardGame: boardGame
  });
});

module.exports = router;
