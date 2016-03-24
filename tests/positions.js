var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var Position = require('../game').Position

describe('Creating a new position', function() {
  
  it('getting a random positions', function(done) {
  	expect(Position.random()).not.to.be.null();
  });

  it('assigns a random coordinates', function(done) {
  	  var p = new Position(10, 20)
      expect(p.x).to.be(10)
      expect(p.x).to.be(20)
      done();
  });

});