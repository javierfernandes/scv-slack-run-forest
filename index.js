var drawing = require('./drawing')

var WebSocket = require('ws'),
    apiToken = "", //Api Token from https://api.slack.com/web (Authentication section)
    authUrl = "https://slack.com/api/rtm.start?token=" + apiToken,
    request = require("request"),
    userId = 'U0375BYGC', // Id for the user the bot is posting as
    channelId = 'C0USL6D2P'; // Id of the channel the bot is posting to

var slack = require('./slack-utils')(apiToken, channelId)
var game = require('./game')(slack)

console.log("Starting up ...")

request(authUrl, function(err, response, body) {
  if (!err && response.statusCode === 200) {
    var res = JSON.parse(body);
    if (res.ok)
      	connectWebSocket(res.url);
    else
    	console.error("Error connecting to slack: " + err + "\nResponse: " + JSON.stringify(response) + "\nBody: " + body)
  }
  else
  	console.error("Error connecting to slack: " + err + "\nResponse: " + JSON.stringify(response) + "\nBody: " + body)
});

function connectWebSocket(url) {
  var ws = new WebSocket(url);

  ws.on('open', function() {
      console.log('Connected');

      slack.sendMessage(ws, "Hola ! Arrancamos un juego ! Los turnos son cada " + game.game.roundDuration + " minutos!");
      drawing.createImage(game.game)
        .then(function() {
      		return slack.sendFile("Round " + game.game.roundNumber);	
      	})
      	.done()

      var CronJob = require('cron').CronJob;
	  new CronJob('0 */' + game.game.roundDuration + ' * * * *', function() {
	  	  game.processTurn(ws)
	  }, null, true, 'America/Los_Angeles');

  });

  ws.on('message', function(message) {
      message = JSON.parse(message);
      if (message.channel === channelId && message.type === 'message' && message.user !== userId) {
      	game.processMessage(ws, message)
      }
  });
}

