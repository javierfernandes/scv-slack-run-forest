var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var Position = require('../game').Position

var Pepito = function(a, b) {
	this.a = a
	this.b = b
}

describe('Creating a random position', function() {
  
  var r = Position.random()

  it('does not return null', function(done) {
  	expect(r).not.to.be.equals(undefined);
  	done()
  });

  it('returns a Position object with x and y', function(done) {
  	expect(r).to.have.property('x')
  	expect(r).to.have.property('y')
  	done()
  });
  
});

describe('Moving a position object', function() {
  
  var p = new Position(100, 100)

  it('UP changes its y coordinate', function(done) {
  	var lastX = p.x
  	var lastY = p.y
  	p.moveUp()
  	expect(p.y).to.be.below(lastY);
  	expect(p.x).to.be.equals(lastX);
  	done()
  });

  it('DOWN changes its y coordinate', function(done) {
  	var lastX = p.x
  	var lastY = p.y
  	p.moveDown()
  	expect(p.y).to.be.above(lastY);
  	expect(p.x).to.be.equals(lastX);
  	done()
  });

  it('RIGHT changes its X coordinate', function(done) {
  	var lastX = p.x
  	var lastY = p.y
  	p.moveRight()
  	expect(p.x).to.be.above(lastX);
  	expect(p.y).to.be.equals(lastY);
  	done()
  });

  it('LEFT changes its X coordinate', function(done) {
  	var lastX = p.x
  	var lastY = p.y
  	p.moveLeft()
  	expect(p.x).to.be.below(lastX);
  	expect(p.y).to.be.equals(lastY);
  	done()
  });
  
});