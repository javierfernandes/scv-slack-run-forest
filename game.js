var sutils = require('./slack-utils')
var sendMessage = sutils.sendMessage
var sendFile = sutils.sendFile
var drawing = require('./drawing')


var Game = {
	roundDuration : 5, // minutes
	roundNumber : 1,
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
		var p = getOrCreatePlayer(message.user)
		if (p.movedThisRound) {
			sendMessage(ws, "Ya gastaste tu turno <@" + message.user + ">. Aguantá la capocha!")
		}
		else {
			// maybe we could add a reaction to the user's message to indicate that the bot has executed the action (?) 
			cb()
		}

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
		var p = new Player(id)
		this.players.push(p)
		return p
	},
	startRound : function() {
		this.roundNumber += 1
		this.players.forEach(function(p) { p.startRound() })
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
	drawing.createImage(Game)
	  .then(function() {
      	return sendFile("Turno " + Game.roundNumber);
      })
      .then(function() {
    	return sendMessage(ws, "Nuevo turno ! Tienen " + turno + " minutos para hacer su movimiento !")    	
      })
      .done();
}

function processMessage(ws, message) {
	if (Game.commands[message.text]) {
		Game.commands[message.text](ws, message);
  	}
}


module.exports = {
	processTurn : processTurn,
	processMessage : processMessage,
	Position : Position,
	game : Game
};