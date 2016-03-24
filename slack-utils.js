var path = require('path')
var SlackUpload = require('node-slack-upload');
var q = require('q')
var fs = require('fs')

// this needs a refactor. Has hardcoded names of the channel, messages and images.

module.exports = function(apiToken, channelId) {
	var slack = new SlackUpload(apiToken)

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
		slack.uploadFile({
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

	return {
		sendMessage : sendMessage,
		uploadFile : uploadFile,
		sendFile : sendFile
	}
}