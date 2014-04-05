var express = require('express'),
    app 	= express();

// Keep an array of messages
var msgs = [];

// Serve index.html as static text
app.use(express.static(__dirname + '/public'));

// Convenience for allowing CORS on routes - GET and POST
app.use(function(req, res, next) {
  var oneof;
  oneof = false;
  if (req.headers.origin) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    oneof = true;
  }
  if (req.headers["access-control-request-method"]) {
    res.header("Access-Control-Allow-Methods", req.headers["access-control-request-method"]);
    oneof = true;
  }
  if (req.headers["access-control-request-headers"]) {
    res.header("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
    oneof = true;
  }
  if (oneof) {
    res.header("Access-Control-Max-Age", 60 * 60 * 24 * 365);
  }
  if (oneof && req.method === "OPTIONS") {
    return res.send(200);
  } else {
    return next();
  }
});

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

var port = process.env.PORT || 80;

app.listen(port, null, function (err) {
  console.log('Your chat server is listening at: http://localhost:' + port);
});