var Canvas = require('canvas');
var	Image = Canvas.Image;
var fs = require('fs');
var q = require('q');


function createImage(game) {
	var d = q.defer();

	var canvas = new Canvas(width, height);
	var ctx = canvas.getContext('2d');

	fs.readFile(__dirname + '/forest.png', function(err, squid) {
	  if (err) throw err;
	  var img = new Image();
	  img.src = squid;
	  ctx.drawImage(img, 0, 0, img.width, img.height);

	  drawUsers(game, ctx, function() {
		  // then
	  	  saveOut(canvas).then(function() {
	  	  	d.resolve();
	  	  });	  	
	  });
	});

	return d.promise;
}

function drawUsers(game, ctx, cb) {
	var promises = [];
	game.users.forEach(function(u) {
		var d = q.defer();
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
	var d = q.defer();
	var out = fs.createWriteStream(__dirname + '/output.png');
	var stream = canvas.pngStream();

	stream.on('data', function(chunk) {
	  out.write(chunk);
	});

	stream.on('end', function() {
	  console.log('saved png');

	  out.end(function() {
	  	d.resolve();
	  });
	});

	return d.promise;
}


module.exports = {
	createImage : createImage
};