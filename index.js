//hello
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var citykey = process.env.CITY_SECRET_KEY;
var citytoken = process.env.CITY_USER_TOKEN;

app.get('/', function (req, res) {
  res.send('Hello World!\ntToken = ' + citytoken);
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});
