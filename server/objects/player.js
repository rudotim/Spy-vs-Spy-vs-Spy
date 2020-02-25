

const utils = require('../utils');
//const uuidv1 = require('uuid/v1');

let Player = function( name )
{
	this.name = name;
	this.id = utils.guid();

	this.pos = { x : 0, y : 0 };
	this.room = -1;
	this.player_def = {};
};

Player.prototype.constructor = Player;

if ( ! (typeof module === 'undefined') )
{
	console.log('Player exported');
	module.exports = Player;
}
else
	console.log('Not Exported');