var express = require('express');
var app = express();

app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.send('Hello Working');
});


module.exports = app;