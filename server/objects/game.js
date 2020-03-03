/**
 * New node file
 */

var Player = require('./player.js');

let Game = function()
{
	// unique identifier
	//this.id = utils.guid();

	// all players in the game
	//this.players = [];

	this.players_loaded = 0;
	this.players_loaded_map = {};

	this.rooms = {};
	
	this.nextPlayerId = 1;
	
	//this.name = '';
	this.jsonMapData;
	
	this.options = {};

	this.leaderName;

	// used to simplify testing
	this.once = false;
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

//-----------------------------------------------------
// Players
//-----------------------------------------------------

Game.prototype.createPlayer = function(player_name, isLeader )
{
	const player = new Player();
	
	player.name = player_name;
	player.id = this.nextPlayerId++;
	player.pos = { x : 0, y: 0 };
	player.room = 0;
	player.isLeader = isLeader;
	player.player_def = null;
	
	this.players.push( player );

	return player;
};

Game.prototype.verifyMapsLoaded = function(player )
{
	this.players_loaded_map[player.id] = player.id;
	
	var keys = Object.keys( this.players_loaded_map  );
	
	console.log('maps loaded? have ', keys.length, ' keys and ', this.players.length, ' players');
	
	return ( keys.length == this.players.length );
}

Game.prototype.getPlayerById = function(id )
{
	var p = this.players.length;
	while ( p-- )
	{
		if ( this.players[p].id == id )
			return this.players[p];
	}
	
	return -1;
};

Game.prototype.getAllPlayerNames = function()
{
	var names = [];
	
	var k = this.players.length;
	while( k-- )
		names.push( this.players[k].name );
	
	return names;
};

Game.prototype.removePlayerById = function(id )
{
	
	/*
	this.player_data[ id ] = null;
	var k = ids.length;
	while( k-- )
	{
		if ( this.ids[k] == id )
		{
			this.ids.splice(k, 1);
			return;
		}
	}
	*/
};

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
