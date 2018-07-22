//var express = require('express');
//var router = express.Router();
var fs = require('fs');

var activeGamesClass = require('./activegames.js');
var activeGames = new activeGamesClass();

module.exports = function (io) 
{
	var ServerLogic = function() 
	{
	};

	ServerLogic.joinRoom = function( gameName, player, configureSocketSubscriptions )
	{
		if ( typeof player.isLeader == 'undefined' )
			return _createRoom(gameName, player, configureSocketSubscriptions );
		
		throw 500;
	}

	function _playersAreTooSimilar( playerConfigJsonA, playerConfigJsonB )
	{
		return false;
	}
	
	ServerLogic.choosePlayer = function( gameId, playerId, playerConfigJson )
	{
		var current_player;

		// find the other players in the game
		var players = activeGames.findPlayersByGameId( gameId );
		var p = players.length;
		while ( p-- )
		{
			// skip checking the player in question
			if ( players[p].id == playerId )
			{
				current_player = players[p];
				continue;
			}

			// if they haven't chosen a color yet...
			if ( players[p].player_def == undefined )
				continue;
			
			// compare colors so we don't have 2 players with the same color
			if ( _playersAreTooSimilar( players[p].player_def, playerConfigJson ))
				return false;
		}
		
		// set server player property
		current_player.player_def = playerConfigJson;
		
		var game = activeGames.findGameById( gameId );
		
		console.log('game name> %o', game.name);
		
		// send message to everybody that this player is now off the market
		io.of( '/' + game.name ).emit('on_chosen_player', playerId, current_player.player_def );
		
		return true;
	}

	
	function _createRoom( gameName, player, configureSocketSubscriptions )
	{	
		// check if it already exists
		var gameInstance = activeGames.findGameByName( gameName );
		var isLeader = (gameInstance == null);
		
		// if it doesn't, create it
		if ( gameInstance == null )
		{
			// add game to list of known active games
			gameInstance = activeGames.createGame( gameName );
					
			// set up socket listeners for client actions
			configureSocketSubscriptions( gameInstance );
		}
		
		// create and add ourself
		var newPlayer = gameInstance.createPlayer( player.name, isLeader );
			
		// return data to ourself
		return {
			"gameInstance"	: gameInstance,
			"player" 		: newPlayer
		};
	}


	ServerLogic.playerHasJoined = function( player, socket )
	{
		console.log('playerHasJoined> %o', player );
	
		// find game associated with player
		var gameInstance = activeGames.findGameByPlayerId( player.id );
		var serverPlayers = gameInstance.players;
		
		socket.broadcast.to(gameInstance.name).emit('on_player_joined', serverPlayers, player);
	}
	
	ServerLogic.playerHasLeft = function( player, socket )
	{
		console.log('playerHasLeft> %o', player );
	
		// find game associated with player
		var gameInstance = activeGames.findGameByPlayerId( player.id );
		
		gameInstance.removePlayerById( player.id );
		
		socket.broadcast.to(gameInstance.name).emit('on_player_left', gameInstance.players, player);
	}
	
	ServerLogic.playerAttributeUpdated = function( player, socket )
	{
		console.log('playerAttributeUpdated> %o', player );
		
		// find game associated with player
		var gameInstance = activeGames.findGameByPlayerId( player.id );
		
		//gameInstance.players.removePlayerById( player.id );
		
		console.log('server[player_attr_updated]> got data : ' + player.name);
		socket.broadcast.to(gameInstance.name).emit('on_player_attr_updated', gameInstance.players, player);
	}
	
	ServerLogic.playerIsReady = function( player, socket )
	{
		var gameInstance = activeGames.findGameByPlayerId( player.id );
	
		socket.broadcast.to(gameInstance.name).emit('on_player_is_ready', player);
	
		// TODO: add something to remember who clicked start
		
		// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
		if ( ++gameInstance.players_loaded >= gameInstance.players.length )
		{
			var levelName = "lobby";
			
			gameInstance.setMapData( _loadMapData( levelName ) );
	
			//chat.emit('on_load_map', gameInstance);					
			io.of( '/' + gameInstance.name ).emit('on_load_map', gameInstance );
		}			
	}
	
	ServerLogic.playerHasLoadedMap = function( player, socket )
	{
		var gameInstance = activeGames.findGameByPlayerId( player.id );
		
		// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
		if ( gameInstance.verifyMapsLoaded(player) === true )
		{
			console.log('setting starting locations...');
			// this will call 'on_player_entered_room'
			_setStartingLocations( gameInstance );
			
			// now start it!
			//chat.emit('on_start_game', gameInstance );
			io.of( '/' + gameInstance.name ).emit('on_start_game', gameInstance );
		}
	}
	
	
	function _setStartingLocations( gameInstance )
	{
		var room;
		var data;  
		var p = gameInstance.players.length;
		while ( p-- )
		{
			console.log('playerIter> %o', gameInstance.players[p] );
			_setStartingLocationForPlayer( gameInstance, gameInstance.players[p] );		
		}
	}
	
	function _setStartingLocationForPlayer( gameInstance, player )
	{
		// find game associated with player
		var gameInstance = activeGames.findGameByPlayerId( player.id );
	
		console.log( 'setting stating location for player ', player.id );
		var room = gameInstance.getStartingLocation( player.id );
		
		// starting location sends us to a room and the physical center
		var teleports_to = {	
		  	"room" : room.id,
		  	"pos" : { 
		  		"x" : 200, 
		  		"y" : 200 
		  	}
		}
			  	
		//chat.emit('on_player_entered_room', player, teleports_to);	
		io.of( '/' + gameInstance.name ).emit('on_player_entered_room', player, teleports_to);	
	}
	
	function _loadMapData( levelName )
	{
		// load map data on server
		return JSON.parse(fs.readFileSync('public/data/level_' + levelName + '.json', 'utf8'));
	}
	
	
	return ServerLogic;
}

