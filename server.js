var express = require('express'),
    app 	= express();

// Keep an array of messages
var msgs = [];

app.use(express.urlencoded());

/*
// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
*/

app.get('/msgs/:since?', function(req, res) {  
  if (!req.params.since) {
    res.json(msgs);
  } else {
    var since = new Date(req.params.since);
    console.log(since);
    var recentMsgs = [];
    msgs.forEach(function(msg) {
      console.log(msg.timestamp);
      if (msg.timestamp > since) {
        recentMsgs.push(msg);
      }
    });
    res.json(recentMsgs);
  }
});

app.post('/msgs', function(req, res) {
  var msg = req.body;
  msg.timestamp = new Date();
  msgs.push(msg);
  res.json(msgs);
});

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 80;

app.listen(port, null, function (err) {
  console.log('Your chat server is listening at: http://localhost:' + port);
});