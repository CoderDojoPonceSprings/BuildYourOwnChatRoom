var msgsDatabase = [];

function msgsSetToSampleData() {
  msgsDatabase.length = 0;

  var newMsgs = new Object();
  newMsgs.refreshSince = "";
  newMsgs.msgs = []; // Empty array

  newMsgs.msgs.push({
    name:'JogoShugh',
    text:'Hello world!',
    timestamp: new Date()
  });
  
  newMsgs.msgs.push({
    name:'DojoCoder',
    text:'I\'m ready to code!',
    timestamp: new Date()
  });
  
  newMsgs.msgs.push({
    name:'Guru',
    text:'I can code circles around JogoShugh!',
    timestamp: new Date()
  });

  msgsGetCompleted(newMsgs, msgsDatabase);
}

function getMyUserName() {
  return $('#name').val();
}

function msgPost(msg, callback) {
  $.post("msgs", msg, msgPostCompleted);
}

function msgPostCompleted(response) {
  if (response == "OK") {
    $('#text').val('');
  } else {
    alert('Something went wrong trying to post new message! Check the developer tools console for more information.');
    console.log(response);
  }
}

function msgPostClick() {
  var text = $('#text').val();
  var name = $('#name').val();
  if (!text) {
    alert('Please type a message in the textbox before sending!');
  } else if (!name) {
    alert('Please type your name in the textbox before sending!');
  } else {
    var msg = {
      text: text,
      name: name
    };
    msgPost(msg);
  }
}

var refreshSince = '';

function msgsGet(since) {
  if (!since) {
    since = "";
  }
  $.get("msgs/" + since, function(newMsgs) {
    newMsgs.msgs.forEach(function(msg) {
      msgsDatabase.push(msg);
    });
    msgsGetCompleted(newMsgs, msgsDatabase);
  });
}

function setDefaultUIMsgsGetCompletedFunction() {
  msgsGetCompleted = function(newMsgs, allMsgs) {
    refreshSince = newMsgs.refreshSince;
    var msgsPublic = $('#msgsPublic');
    newMsgs.msgs.forEach(function(msg) {
      /* This is the HTML structure we need to created for each message:
        <article data-self='true' data-user='DojoCoder'>
          <header>DojoCoder:</header>
          <p>
            I'm ready to code!
          </p>
          <time datetime='2014-04-06T02:14:20.718Z'>10:21 PM</time>
        </article>
      */      
      var isMyMessage = msg.name == getMyUserName();
      var timestamp = new Date(msg.timestamp);
      var time = timestamp.toLocaleTimeString('en-US', 
        {hour: '2-digit', minute:'2-digit'});
      var newMessage = 
        "<article style='display:none'"
          + " data-self='" + isMyMessage + "'"
          + " data-user='" + msg.name + "'>\n"
          + "\t<header>" + msg.name + ":</header>\n"
          + "\t<p>" + msg.text + "</p>\n"
          + "\t<time datetime='" + msg.timestamp + "'>" + time + "</time>\n"
        + "</article>";
      var newMessageElement = $(newMessage);
      msgsPublic.prepend(newMessageElement);
      newMessageElement.fadeIn("slow");
    });
  };
}

function setDefaultConsoleMsgsGetCompletedFunction() {
  msgsGetCompleted = function(newMsgs, allMsgs) {
    refreshSince = newMsgs.refreshSince;
    console.log('New messages count: ' + newMsgs.msgs.length);
    newMsgs.msgs.forEach(function(msg) {
      var isMyMessage = msg.name == getMyUserName();
      var json = JSON.stringify(msg);
      if (isMyMessage) {
        console.log("You said:");
      }
      else {
        console.log(msg.name + " said:");
      }
      console.log(json);
    });
    console.log('Most recently seen message date: ' + newMsgs.refreshSince);
  };
}

function msgsGetNewOnce() {
  var since = $('#since').val();
  if (!since) {
    since = refreshSince;
  }
  msgsGet(since);
}

var msgsGetNewRepeatedlyIntervalId = null;

function msgsGetNewRepeatedlyStart() {
  msgsGetNewRepeatedlyStop(); // In case we already are
  function callMsgsGet() {
    msgsGet(refreshSince);
  }
  callMsgsGet(); // Call it once
  // And now call it repeatedly every 2.5 seconds!
  msgsGetNewRepeatedlyIntervalId = setInterval(callMsgsGet, 2500);
}

function msgsGetNewRepeatedlyStop() {
  if (msgsGetNewRepeatedlyIntervalId != null) {
    clearInterval(msgsGetNewRepeatedlyIntervalId);
    msgsGetNewRepeatedlyIntervalId = null;
  }
}

function allowGetMsgsButton() {
  $("#pauseGettingMsgsButton").attr("disabled", "disabled"); 
  $("#getMsgsButton").removeAttr("disabled");
}

function allowPauseGetttingMsgsButton() {
  $("#pauseGettingMsgsButton").removeAttr("disabled");
  $("#getMsgsButton").attr("disabled", "disabled");
}

function styleGetChoices() {
  $.getJSON( "styles", function(data) {
    var styles = $('#styles')[0];
    styles = $(styles);
    data.forEach(function(item) {
      styles.append('<option value="' + item.name + '|' + item.id + '">' + item.name + ' by ' + item.user + '</option>');
    });
  });  
}

function styleApply() {
  var styleVals = $('#styles').val().split('|');
  var href = 'http://run.plnkr.co/plunks/' + styleVals[1] + '/style.css';
  var styleId = "style-" + styleVals[1];
  // Check if we already have this style
  var style = $('#' + styleId);
  if (style.length == 0) {
    $('body').append('<link id="' + styleId + '" '
      + 'rel="stylesheet" href="'
      + href + '" type="text/css" />');
  }  
  setTimeout(function() {
    $('link[rel=stylesheet]').each(function() {
      // The function is "applied" in the context of each matching
      // element. So, the 'this' object points to the element.
      if (this.id && this.id != styleId) {
        $(this).attr('disabled', 'disabled')
      } else if (this.id && this.id == styleId) {
        $(this).removeAttr('disabled');
      }
    });
  }, 1000);
}

$(function() {
  // Configure some defaults
  setDefaultUIMsgsGetCompletedFunction();
  msgsSetToSampleData();
  msgsGetNewRepeatedlyStart();
  $('#text').bind("keypress", function(e) {
    if (e.keyCode === 13) msgPostClick();
  });
  styleGetChoices();
});