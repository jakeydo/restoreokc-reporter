//hello
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var citykey = process.env.CITY_SECRET_KEY;
var citytoken = process.env.CITY_USER_TOKEN;
const crypto = require('crypto');


app.get('/', function (req, res) {
  var signature = signatureForRequest("GET", "https://api.onthecity.org/users/529144", "");
  res.send('Hello World!<br>sig = ' + signature);
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});

function signatureForRequest(verb, address, body){
  var hmac = crypto.createHmac('sha256', citykey);
  var unixTime = Date.now();
  unixTime = 1474550892;
  var stringToSign = "" + unixTime + verb + address + body;
  hmac.update(stringToSign);
  var signature = encodeURIComponent(hmac.digest('base64'));
  
  return signature;
}
