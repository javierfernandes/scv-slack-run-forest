var path = require('path')
var SlackUpload = require('node-slack-upload')
var q = require('q')
var fs = require('fs')

var http = require('http');
var https = require('https')

var Slack = require('slack-node')


// this needs a refactor. Has hardcoded names of the channel, messages and images.

module.exports = function(apiToken, channelId) {
	var slackUpload = new SlackUpload(apiToken)
	
	function sendMessage(ws, text) {
		ws.send(JSON.stringify({ channel: channelId, id: 1, text: text, type: "message" }));
	}

	function sendFile(name) {
		console.log("Sending file...")
		return uploadFile('output.png', name, channelId)
	}

	function uploadFile(fileName, text, channelId) {
		var d = q.defer()
	  	var thepath = path.join(__dirname, 'output.png')
  		console.log("Sending " + thepath)
		slackUpload.uploadFile({
			file: fs.createReadStream(thepath),
			filetype: 'auto',
			title: text,
			initialComment: text,
			channels: 'C0USL6D2P'
		}, function(err) {
			if (err) {
				console.error(err)
				d.reject(err)
			}
			else {
				console.log('done')
				d.resolve()
			}
		})
		return q.promise
	}

	var slackApi = new Slack(apiToken);

	function getUserInfo(id) {
		var d = q.defer()
		slackApi.api("users.info", { user : id }, function(err, response) {
		  if (err) d.reject(err)
		  else d.resolve(response)
		});
		return d.promise
	}

	function download(url, to) {
		console.log("downloading " + url)
		var d = q.defer()
		var file = fs.createWriteStream(__dirname + "/" + to);
		var protocol = url.indexOf('https') === 0 ? https : http;

		var request = protocol.get(url, function(response) {
		  response.pipe(file);
		  file.on('finish', function() {
		    file.close(function() {
		    	d.resolve(response)	
		    });
		  })
		}).on('error', function(err) { // Handle errors
		    fs.unlink(dest); // Delete the file async. (But we don't check the result)
			d.reject(err)    
		});
		return d.promise
	}

	return {
		sendMessage : sendMessage,
		uploadFile : uploadFile,
		sendFile : sendFile,
		getUserInfo : getUserInfo,
		download : download
	}
}