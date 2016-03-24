var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var slack = require('../slack-utils')('xoxp-2946387922-10526329685-10522542354-0a431f080b', 'channelId');

describe('Getting user info', function() {
  
  it('does not return null', function(done) {
    slack.getUserInfo('U03C73RAE')
      .then(function(response) {
        var imageURL = response.user.profile.image_24

        var extension = imageURL.substring(imageURL.lastIndexOf('.') + 1)
        expect(extension).to.be.equals("jpg")

        slack.download(imageURL, 'U03C73RAE.' + extension).then(function() {
          done()  
        })
      })
      .done()
  });
  
});