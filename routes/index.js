const express = require('express');
const BoardGame = require("../models/boardGame");
const router = express.Router();

router.get('/', function(req, res) {
  const boardGame = new BoardGame(3, 4)
  res.render('index', {
    title: 'Yokai no mori',
    rulesLink: 'https://cdn.1j1ju.com/medias/21/ee/be-yokai-no-mori-regle.pdf',
    tileSize: 120,
    boardGame: boardGame
  });
});

module.exports = router;
