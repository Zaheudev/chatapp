var express = require('express');
var router = express.Router();
var app = express();

/* GET home page. */
router.get('/', function(req, res) {
    res.sendFile("home.html", {root: "./public/html"})
  });

  /* GET room page when pressing on join room button. */
router.get('/room', function(req, res) {
    res.sendFile("room.html", {root: "./public/html"})
  });

  module.exports = router;