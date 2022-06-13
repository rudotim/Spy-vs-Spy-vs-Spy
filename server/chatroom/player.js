

const utils = require('../utils');

let Player = function( name )
{
	// base properties
	this.name = name;
	this.id = utils.guid();

	// player selection
	//this.color = undefined;
	//this.ready = undefined;

	// game play
	//this.pos = { x : 0, y : 0 };
	//this.room = -1;
};

Player.prototype.constructor = Player;

if ( ! (typeof module === 'undefined') )
{
	console.log('Player exported');
	module.exports = Player;
}
else
	console.log('Not Exported');