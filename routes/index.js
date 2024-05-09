const express = require('express');
const BoardGame = require("../models/boardGame");
const bcrypt = require('bcryptjs')
const router = express.Router()
const config = require('../config')

router.get('/', function(req, res) {
  res.render('auth');
})

router.post('/', function(req, res) {
  bcrypt.compare(req.body.password, config.hashPassword, function(err, result) {
    if (result === false) {
      res.render('auth', {state: 'invalid'})
    } else {
      res.render('index', {
        rulesLink: config.rulesLink,
        tileSize: 120,
        boardGame: new BoardGame(3, 4),
      })
    }
  })
})

module.exports = router;
