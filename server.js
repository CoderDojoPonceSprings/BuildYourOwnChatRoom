var express = require('express'),
    app 	= express();

// Keep an array of messages
var msgs = [];

app.use(express.urlencoded());

function createResponse(newMsgs) {
  var refreshSince = new Date();
  if (newMsgs.length > 0) {
    refreshSince = newMsgs[newMsgs.length-1].timestamp;
  }
  return {
    msgs: newMsgs,
    refreshSince: refreshSince
  };
}

app.get('/msgs/:since?', function(req, res) {
  if (!req.params.since) {
    res.json(createResponse(msgs));
  } else {
    var since = new Date(req.params.since);
    var recentMsgs = [];
    console.log('asking since:');
    console.log(since);
    console.log('actual most recent:');
    if (msgs.length > 0) {
      console.log(msgs[msgs.length-1].timestamp);
    }
    msgs.forEach(function(msg) {
      if (msg.timestamp > since) {
        recentMsgs.push(msg);
      }
    });
    res.json(createResponse(recentMsgs));
  }
});

app.post('/msgs', function(req, res) {
  var msg = req.body;
  msg.timestamp = new Date();
  msgs.push(msg);
  res.send("OK");
});

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 80;

app.listen(port, null, function (err) {
  console.log('Your chat server is listening at: http://localhost:' + port);
});


/*
// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
*/
