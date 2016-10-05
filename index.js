//hello
var express = require('express');
var request = require('request');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
//var Buffer = require('buffer');
var app = express();
var port = process.env.PORT || 3000;
var citykey = process.env.CITY_SECRET_KEY;
var citykeybytes = Buffer.from(citykey);
var citytoken = process.env.CITY_USER_TOKEN;
var mailgunkey = process.env.MAILGUN_KEY;
var sendaddress = process.env.SEND_ADDRESS;
var fundid = "18081";
var report_id;
//citytoken = Buffer.from(citytoken);
const crypto = require('crypto');


app.get('/', function (req, res) {
  //var signature = signatureForRequest("GET", "https://api.onthecity.org/users/529144", "");
  createNewReport(fundid);
  res.send('Check your e-mail in a minute for the latest report!');
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});

function createNewReport(fund){
  var verb = "POST";
  var address = "https://api.onthecity.org/donations/exports";
  var bodyForPost = JSON.stringify({fund_id: fundid});//"{\"fund_id\": \""+fundid+"\"}";

  performCityAPIRequest(verb, address, bodyForPost, function(response){
    response_body = JSON.parse(response.body);
    report_id = response_body.id;
    console.log("report id: " + report_id);
    console.log("wait a minute and see what happens i guess");
    setTimeout(emailReportLink, 60000);
  });
}

function performCityAPIRequest(verb, address, body, callback){
  var timeused = Date.now();
  var sig = signatureForRequest(verb, address, body, timeused);
  var headersForPost =
  { "X-City-Sig": sig,
    "X-City-User-Token": citytoken,
    "Accept": "application/vnd.thecity.admin.v1+json",
    "X-City-Time": timeused
  }

  request({url:address, method:verb, followAllRedirects:true, forever:true, headers:headersForPost, body: body}, function(error, response, html){
    //console.log(response);
    callback(response);
  });

}

function emailReportLink(){
  console.log("waited a minute, let's see if it works");
  var verb = "GET";
  var address = "https://api.onthecity.org/donations/exports/" + report_id;
  var body = "";
  performCityAPIRequest(verb,address,body,function(response){
    var response_body = JSON.parse(response.body);
    var url = response_body.authenticated_s3_url;
    console.log(url);

    request(url, function(error, reponse, body){

      //now email it to me
      var auth = { auth: {
          api_key: mailgunkey,
          domain: 'mg.jakespencer.net'
        }
      }

      var transporter = nodemailer.createTransport(mg(auth));

      var message = "The newest donor report for Restore OKC is attached."

      var mailOptions = {
          from: 'Jake Spencer <jake@mg.jakespencer.net>', // sender address
          to: sendaddress, // list of receivers
          subject: 'Restore OKC Donor Report', // Subject line
          text: message, // plaintext body
          attachments: [{filename: "RestoreOKCReport.csv", content:body}]
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              console.log(error);
          }else{
              console.log('Message sent, no error ');
          }
      });
    })



  });
}

function signatureForRequest(verb, address, body, time){
  var hmac = crypto.createHmac('sha256', citykeybytes);
  //var unixTime = Date.now();
  //unixTime = 1475205818;
  var stringToSign = "" + time + verb + address + body;
  hmac.update(stringToSign);
  var signature = encodeURIComponent(hmac.digest('base64'));
  console.log('String to sign: ' + stringToSign);
  console.log(signature);
  return signature;
}
