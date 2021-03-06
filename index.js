var fs = require('fs');
var q = require('q');

var Canvas = require('canvas');
var	Image = Canvas.Image;

var width = 600;
var height = 756;


var users = [];

function createImage() {
	var canvas = new Canvas(width, height)
	var ctx = canvas.getContext('2d');

	fs.readFile(__dirname + '/forest.png', function(err, squid) {
	  if (err) throw err;
	  var img = new Image();
	  img.src = squid;
	  ctx.drawImage(img, 0, 0, img.width, img.height);

	  drawUsers(ctx, function() {
		  // then
	  	  saveOut(canvas);	  	
	  });
	});
}

function drawUsers(ctx, cb) {
	var promises = [];
	users.forEach(function(u) {
		var d = q.defer()		
		fs.readFile(path.join(__dirname, u.image + '.png'), function(err, squid) {
			if (err) throw err;
			var img = new Image();
			img.src = squid;
			ctx.drawImage(img, u.position[0], u.position[1], img.width, img.height);
			d.resolve();
		});
		promises.push(d.promise);
	});

	q.all(promises).then(function() {
		cb();
	}).done();

}

function saveOut(canvas) {
	var out = fs.createWriteStream(__dirname + '/output.png');
	var stream = canvas.pngStream();

	stream.on('data', function(chunk) {
	  out.write(chunk);
	});

	stream.on('end', function() {
	  console.log('saved png');

	  out.end(function() {
	  	sendFile();
	  });
	});
}

var SlackUpload = require('node-slack-upload');
var path = require('path')

var WebSocket = require('ws'),
    apiToken = "", //Api Token from https://api.slack.com/web (Authentication section)
    authUrl = "https://slack.com/api/rtm.start?token=" + apiToken,
    request = require("request"),
    userId = 'U0375BYGC', // Id for the user the bot is posting as
    channelId = 'C0USL6D2P'; // Id of the channel the bot is posting to

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

      var CronJob = require('cron').CronJob;
	  new CronJob('* */30 * * * *', function() {
	  	  users.forEach(function(u) { u.moved = false })
	  	  createImage();
	  	  var message = "Tienen 30 minutos para hacer su movimiento !";
		  ws.send(JSON.stringify({ channel: channelId, id: 1, text: message, type: "message" }));
	  }, null, true, 'America/Los_Angeles');

  });

  ws.on('message', function(message) {
      // console.log('received:', message);

      message = JSON.parse(message);

      if (message.channel === channelId && message.type === 'message' && message.user !== userId) {
      	if (message.text === "arriba" || message.text === "abajo" || message.text === "izquierda" ||message.text === "derecha") {
      		 var moved = false;
      		 users.forEach(function(u) {
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
      		 	users.push({userId: message.user, position : randomPosition(), image: "U03C73RAE"})
      		 	u.moved = true
      		 }
      	}
      }
  });
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

