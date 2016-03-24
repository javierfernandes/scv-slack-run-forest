var drawing = require('./drawing')
var SlackUpload = require('node-slack-upload');
var path = require('path')
var WebSocket = require('ws'),
    apiToken = "", //Api Token from https://api.slack.com/web (Authentication section)
    authUrl = "https://slack.com/api/rtm.start?token=" + apiToken,
    request = require("request"),
    userId = 'U0375BYGC', // Id for the user the bot is posting as
    channelId = 'C0USL6D2P'; // Id of the channel the bot is posting to


var width = 600;
var height = 756;

var game {
	users : []
}

request(authUrl, function(err, response, body) {
  if (!err && response.statusCode === 200) {
    var res = JSON.parse(body);
    if (res.ok) {
      connectWebSocket(res.url);
    }
  }
});

function connectWebSocket(url) {
  var ws = new WebSocket(url);

  ws.on('open', function() {
      console.log('Connected');
      var turno = 5

      sendMessage(ws, "Hola ! Arrancamos un juego ! Los turnos son cada " + turno + " minutos!");
      drawing.createImage(game).then(function() {
      	sendFile();	
      })

      var CronJob = require('cron').CronJob;
	  new CronJob('0 */' + turno + ' * * * *', function() {
	  	  processTurn(ws, turno)
	  }, null, true, 'America/Los_Angeles');

  });

  ws.on('message', function(message) {
      message = JSON.parse(message);
      if (message.channel === channelId && message.type === 'message' && message.user !== userId) {
      	processMessage(ws, message)
      }
  });
}

function processTurn(ws, turno) {
	game.users.forEach(function(u) { u.moved = false })
	drawing.createImage(game).then(function() {
      	return sendFile();	
    }).then(function() {
    	sendMessage("Tienen " + turno + " minutos para hacer su movimiento !")    	
    })
}

function sendMessage(ws, text) {
	ws.send(JSON.stringify({ channel: channelId, id: 1, text: text, type: "message" }));
}

function processMessage(ws, message) {
	if (message.text === "arriba" || message.text === "abajo" || message.text === "izquierda" ||message.text === "derecha") {
  		 var moved = false;
  		 game.users.forEach(function(u) {
  		 	if (u.userId === message.user) {
  		 		if (u.moved) {
  		 			var text = "Ya gastaste tu turno @" + message.user + ". Aguantá la capocha!"
  		 			ws.send(JSON.stringify({ channel: channelId, id: 1, text: text, type: "message" }));
  		 			moved = true
  		 		}
  		 		else {
      		 		var delta = 50;
      		 		var deltaX = (message.text === "izquierda") ? delta*-1 : ((message.text === "derecha") ? delta : 0);
      		 		var deltaY = (message.text === "arriba") ? delta*-1 : ((message.text === "abajo") ? delta : 0);
      		 		
					u.position[0] = u.position[0] + deltaX;
      		 		u.position[1] = u.position[1] + deltaY;

      		 		u.moved = true
  		 		}
  		 	}
  		 });
  		 if (!moved) {
  		 	var u = {userId: message.user, position : randomPosition(), image: "U03C73RAE"};
  		 	users.push(u);
  		 	u.moved = true;
  		 }
  	}
}

function randomPosition() { return [randomBetween(0, width) , randomBetween(0, height)]}

function randomBetween(start, end) {
	// TODO: round to 50 which is the steps (delta). I mean the grid cell size
	return Math.floor(Math.random() * end) + start;
}

function sendFile() {
	console.log("sending file...")
	uploadFile('output.png', "Estado", channelId, function() {})
}

function uploadFile(fileName, text, channelId, then) {
  var slack = new SlackUpload(apiToken);
  console.log("Sending " + fileName + " con texto " + text + " en " + channelId);

  var thepath = path.join(__dirname, 'output.png');

  console.log("Sending " + thepath);
	slack.uploadFile({
		file: fs.createReadStream(thepath),
		filetype: 'auto',
		title: 'README',
		initialComment: 'my initial commit',
		channels: 'C0USL6D2P'
	}, function(err) {
		if (err) {
			console.error(err);
		}
		else {
			console.log('done');
		}
	});
}

