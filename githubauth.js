var http    = require('http'),
    qs      = require('querystring'),
    fs      = require('fs'),
    express = require('express'),  
    https   = require('https');

module.exports = function(app) {
  // Load config defaults from JSON file.
  // Environment variables override defaults.
  function loadConfig() {
    var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
    for (var i in config) {
      config[i] = process.env[i.toUpperCase()] || config[i];
    }
    return config;
  }

  var config = loadConfig();

  function authenticate(code, cb) {
    var data = qs.stringify({
      client_id: config.oauth_client_id,
      client_secret: config.oauth_client_secret,
      code: code
    });

    var reqOptions = {
      host: config.oauth_host,
      port: config.oauth_port,
      path: config.oauth_path,
      method: config.oauth_method,
      headers: { 'content-length': data.length }
    };

    var body = "";
    var req = https.request(reqOptions, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function() {
        cb(null, qs.parse(body).access_token);
      });
    });

    req.write(data);
    req.end();
    req.on('error', function(e) { cb(e.message); });
  }

  app.use(express.json({strict: true}));
  
  app.get('/authenticate/:code', function(req, res) {
    console.log('authenticating code:' + req.params.code);
    authenticate(req.params.code, function(err, token) {
      var result = err || !token ? {"error": "bad_code"} : { "token": token };
      console.log(result);
      res.json(result);
    });
  });
}