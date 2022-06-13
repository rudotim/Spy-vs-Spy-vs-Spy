/**
 * New node file
 */

const utils = require('../utils');

var Player = require('./player.js');

let Game = function( chatroom, options )
{
	// unique identifier
	this.id = utils.guid();

	this.options = options;

	// the chatroom this game is playing in.  we will use the chatroom
	// to access our player list and the name of the game.
	this.chatroom = chatroom;

	this.name = chatroom.name;

	//this.initializePlayers( this.chatroom.players, this.options );

	this.players_loaded = 0;
	this.players_loaded_map = {};

	this.rooms = {};
	
	this.nextPlayerId = 1;
	
	this.jsonMapData = undefined;
	
	this.leaderName = undefined;

	// used to simplify testing
	this.once = false;
};

Game.prototype.initializePlayers = function()
{
	this.chatroom.players.forEach( player =>
	{
		this.initializePlayer( player, this.options );
	});
};

Game.prototype.initializePlayer = function( player, options )
{
	if ( ! player.game )
	{
		player.game = {};
		player.game.color = options.defaultPlayerColor;
		player.game.ready = false;
		player.game.text = undefined;

		console.log("initialized player> %o", player);
	}
};

Game.prototype.constructor = Game;

Game.prototype.setLeader = function( playerName )
{
	this.leaderName = playerName;
};

Game.prototype.getStartingLocation = function(player_id )
{
	console.log('getting starting location for player id> %o', player_id);
	
	let room;
	
	if ( this.once )
		room = this.jsonMapData.rooms[0];
	else
	{
		this.once = true;
		room = this.jsonMapData.rooms[1];
	}
	
	console.log('returning room> %o', room );

	return room;
};

Game.prototype.setMapData = function(jsonMapData )
{
	console.log('map data has been set');
	this.jsonMapData = jsonMapData;
};

Game.prototype.setOptions = function(newOptions )
{
	this.options = newOptions;
};

Game.prototype.verifyMapsLoaded = function(player )
{
	this.players_loaded_map[player.id] = player.id;
	
	const keys = Object.keys( this.players_loaded_map  );
	
	console.log('maps loaded? have ', keys.length, ' keys and ', this.players.length, ' players');
	
	return ( keys.length === this.players.length );
}

//-----------------------------------------------------
// Utils
//-----------------------------------------------------

if ( ! (typeof module === 'undefined') )
{
	console.log('Game exported');
	module.exports = Game;
}
else
	console.log('Not Exported');
