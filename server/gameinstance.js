/**
 * New node file
 */
var Player = require('./player.js');

var GameInstance = function()
{
	this.game_id = guid();
	
	this.players = [];
	this.nextPlayerId = 1;
	
	this.name = '';
	this.jsonMapData;
	
	this.chatchannel = '';
	this.datachannel = '';
	
	this.options = {};
	
	this.once = false;
}

GameInstance.prototype.constructor = GameInstance;

GameInstance.prototype.setGameId = function( game_id )
{
	this.game_id = game_id;
}

GameInstance.prototype.setName = function( name )
{
	this.name = name;
}

GameInstance.prototype.getStartingLocation = function( player_id )
{
	console.log('getting starting location for player id> %o', player_id);
	console.log('returning room> %o', this.jsonMapData.rooms[0] );
	
	if ( this.once )
		return this.jsonMapData.rooms[0];
	else
	{
		this.once = true;
		return this.jsonMapData.rooms[1];
	}
}

GameInstance.prototype.setMapData = function( jsonMapData )
{
	console.log('map data has been set');
	this.jsonMapData = jsonMapData;
}

GameInstance.prototype.setOptions = function( newOptions )
{
	this.options = newOptions;
}

GameInstance.prototype.setChatChannel = function( channel )
{
	this.chatchannel = channel;
}

GameInstance.prototype.setDataChannel = function( channel )
{
	this.datachannel = channel;
}

//-----------------------------------------------------
// Players
//-----------------------------------------------------

GameInstance.prototype.createPlayer = function( player_name, isLeader )
{
	var player = new Player();
	
	player.name = player_name;
	player.id = this.nextPlayerId++;
	player.pos = { x : 0, y: 0 };
	player.room = 0;
	player.isLeader = isLeader;
	player.player_def = null;
	
	this.players.push( player );

	return player;
};

GameInstance.prototype.getPlayerById = function( id )
{
	var p = this.players.length;
	while ( p-- )
	{
		if ( this.players[p].id == id )
			return this.players[p];
	}
	
	return -1;
};

GameInstance.prototype.getAllPlayerNames = function()
{
	var names = [];
	
	var k = this.players.length;
	while( k-- )
		names.push( this.players[k].name );
	
	return names;
};

GameInstance.prototype.removePlayerById = function( id )
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
} 

//-----------------------------------------------------
// Utils
//-----------------------------------------------------

function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

if ( ! (typeof module === 'undefined') )
{
	console.log('GameInstance exported');
	module.exports = GameInstance;
}
else
	console.log('Not Exported');
