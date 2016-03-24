

var Game = {
	players : [],
	cellSize : 50,
	width : 600,
	height :756,
	commands : {
		arriba : function(ws, message) { doWithPlayer(ws, message, function(player) { 	player.moveUp() 	}) },
		abajo: function(ws, message) { doWithPlayer(ws, message, function(player) { 	player.moveDown() 	}) },
		izquierda: function(ws, message) { doWithPlayer(ws, message, function(player) { player.moveLeft() 	}) },
		derecha: function(ws, message) { doWithPlayer(ws, message, function(player) { 	player.moveRight() 	}) }
	},
	doWithPlayer : function(ws, message, cb) {
		cb(getOrCreatePlayer(message.user))
		// maybe we could add a reaction to the user's message to indicate that the bot has executed the action (?)
	},
	getOrCreatePlayer : function(id) {
		var p = getPlayer(id)
		return p ? p : createPlayer(id)
	},
	getPlayer : function(id) {
		player.forEach(function(p) {
  			if (p.userId === id)
  				return p;
  		})
  		return undefined;
	},
	createPlayer : function(id) {
		var p = new Player(message.user)
		players.push(p)
		return p
	},
	startRound : function() {
		players.forEach(function(p) { p.startRound() });
	}
}


function Player(userId) {
	this.userId = userId;
	this.position = Position.random();
	this.movedThisRound = false;
	this.getImageName = function() { return "U03C73RAE" }
	this.startRound = function() {
		this.movedThisRound = false
	}
	this.moveUp = function() { this.position.moveUp() }
	this.moveDown = function() { this.position.moveDown() }
	this.moveLeft = function() { this.position.moveLeft() }
	this.moveRight =  function() { this.position.moveRight() }
}

function Position(x, y) {
	this.x = x
	this.y = y
	cellSize = Game.cellSize
	
	this.moveRight 	= function() { this.x += cellSize }
	this.moveLeft 	= function() { this.x -= cellSize }
	this.moveUp 	= function() { this.y -= cellSize }
	this.moveDown 	= function() { this.y += cellSize }
}
Position.random = function() {
	return new Position(this.randomBetween(0, Game.width), this.randomBetween(0, Game.height))
}
Position.randomBetween = function(start, end) {
	// TODO: round to 50 which is the steps (delta). I mean the grid cell size
	return Math.floor(Math.random() * end) + start;
}



function processTurn(ws, turno) {
	Game.startRound()
	drawing.createImage(game)
	  .then(function() {
      	return sendFile();
      }).then(function() {
    	sendMessage("Nuevo turno ! Tienen " + turno + " minutos para hacer su movimiento !")    	
    });
}

function processMessage(ws, message) {
	if (Game.commands[message.text]) {

		Game.commands[message.text](ws, message);

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


module.exports = {
	processTurn : processTurn,
	processMessage : processMessage,
	Position : Position
};