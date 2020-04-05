/**
 * New node file
 */
const utils = require('../utils');

const Player = require('./player.js');

let ChatRoom = function( name )
{
	// unique identifier
	this.id = utils.guid();

	// all players in the game
	this.players = [];

	this.name = name;

	this.game = undefined;

	this.options = {};

	this.leaderName = undefined;
};

ChatRoom.prototype.constructor = ChatRoom;

// ChatRoom.prototype.setGameId = function(game_id )
// {
// 	this.id = game_id;
// };

// ChatRoom.prototype.setName = function(name )
// {
// 	this.name = name;
// };

ChatRoom.prototype.setLeader = function( playerName )
{
	this.leaderName = playerName;
};


if ( ! (typeof module === 'undefined') )
{
	console.log('Game exported');
	module.exports = ChatRoom;
}
else
	console.log('Not Exported');
