"use strict";

var uuid = require('node-uuid'),
    fs = require('fs'),
    sys = require('sys'),
    exec = require('child_process').exec;

var opensslUtil = {};

var getInputFile = function (req) {
    var clientIP = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    
    var guid = uuid.v1();
    
    var filename = './tmp/' + clientIP + '_' + guid;

    return filename;
}

opensslUtil.parse = function (req, res) {
    var filename = getInputFile(req);
    console.log(filename);
    
    if (typeof(req.body.data) != 'string') {
        res.status(500)
           .send({ 'error': 'Must provide data to parse' });
        return;
    }
    
    var data = req.body.data.trim();
    fs.writeFile(filename, data, function (error) {
        if (error) {
            console.log(JSON.stringify(error));
            res.status(500)
               .send({ 'error': JSON.stringify(error) });
            return;
        }
        
        var osslTool = '';
        if (data.indexOf('-----BEGIN CERTIFICATE REQUEST-----') >= 0) {
            osslTool = 'req';
        } else if (data.indexOf('-----BEGIN CERTIFICATE-----') >= 0) {
            osslTool = 'x509';
        } else if (data.indexOf('-----BEGIN X509 CRL-----') >= 0) {
            osslTool = 'crl';
        } else if (data.indexOf('-----BEGIN PKCS7-----') >= 0) {
            osslTool = 'pkcs7';
        } else if (data.indexOf('-----BEGIN PKCS12-----') >= 0) {
            osslTool = 'pkcs12';
        } else if (data.indexOf('-----BEGIN RSA PRIVATE KEY-----') >= 0) {
            osslTool = 'rsa';
        } else if (data.indexOf('-----BEGIN DSA PRIVATE KEY-----') >= 0) {
            osslTool = 'dsa';
        } else {
            res.status(500)
               .send({'error': 'Bad input data'});
            return;
        }
            
        var cmd = 'openssl ' + osslTool + ' -inform PEM -in ' + filename + ' -text -noout';
        console.log(cmd);
            
        exec(cmd, function (error, stdout, stderr) {
            sys.puts('error: ' + error);
            sys.puts('stdout: ' + stdout);
            sys.puts('stderr: ' + stderr);
            var output = {
                'results': (stdout.trim().length > 0) ? stdout.trim() : stderr.trim()
            };
            res.send(JSON.stringify(output));
                
            // delete temp data file
            fs.unlink(filename);
        });
    });
}

module.exports = opensslUtil;