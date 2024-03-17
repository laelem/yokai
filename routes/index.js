const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('game', {
    title: 'Yokai no mori',
    xNbTile: 3,
    yNbTile: 4,
    tileSize: 200
  });
});

module.exports = router;
