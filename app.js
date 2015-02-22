"use strict";

var express = require('express'),
    bodyParser = require('body-parser'),
    osslUtil = require('./openssl-util');

var app = express();

app.use(bodyParser.text());
app.use(bodyParser.json());


app.get('/', function (req, res) {
    res.send('rest-openssl-parser');
});

// REST APIs

// GET request
app.get('/api', function (req, res) {
    var apis = [
        '/api',
        '/api/parse'
    ];
    res.send(apis);
});

// POST request
app.post('/api/parse', function (req, res) {
    //console.log("POST (create): " + JSON.stringify(req.headers) + "\n" + JSON.stringify(req.body));
    osslUtil.parse(req, res);
});

// POST request
app.post('/api/parse-file', function (req, res) {
    res.send('Got a POST request for /api/parse-file.');
});


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('MyApp server listening at http://%s:%s', host, port);
});