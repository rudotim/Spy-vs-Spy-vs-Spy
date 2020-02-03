//var express = require('express');
//var router = express.Router();
const fs = require('fs');

const activeGamesClass = require('./objects/activegames.js');
let activeGames = new activeGamesClass();

module.exports = function (io)
{
	const ServerLogic = function()
	{
	};

	/**
	 * Join a room.  This will create the room and add you to it if it did not exist.
	 * If the room did not exist, you will be marked as the leader of the room.
	 * That means you can perform admin actions like starting the game,
	 * removing users and changing admin properties.
	 */
	ServerLogic.joinRoom = function( gameName, player, configureSocketSubscriptions )
	{
		// TODO: verify if this 'isLeader' crap is a bad way to know whether or not to create a room
		if ( typeof player.isLeader === 'undefined' )
			return _createRoom(gameName, player, configureSocketSubscriptions );
		
		throw 500;
	};

	
	ServerLogic.choosePlayer = function( gameId, playerId, playerConfigJson )
	{
		const current_player = activeGames.findPlayerByGameId( gameId, playerId );

		// // find the other players in the game
        // let players = activeGames.findPlayersByGameId( gameId );
        // let p = players.length;
		// while ( p-- )
		// {
		// 	// skip checking the player in question
		// 	if ( players[p].id === playerId )
		// 	{
		// 		current_player = players[p];
		// 		continue;
		// 	}
        //
		// 	// if they haven't chosen a color yet...
		// 	if ( players[p].player_def === undefined )
		// 		continue;
		//
		// 	// compare colors so we don't have 2 players with the same color
		// 	if ( _playersAreTooSimilar( players[p].player_def, playerConfigJson ))
		// 		return false;
		// }
		
		// set server player property
		current_player.player_def = playerConfigJson;
		
		let game = activeGames.findGameById( gameId );
		
		console.log('game name> %o', game.name);
		
		// send message to everybody that this player is now off the market
		io.of( '/' + game.name ).emit('on_chosen_player', playerId, current_player.player_def );
		
		return true;
	}

	
	/**
	 * Create a new room with name and set player as the leader.  Also configure
	 * first time socket subscriptions.
	 */
	function _createRoom( gameName, player, configureSocketSubscriptions )
	{	
		// check if it already exists
		let gameInstance = activeGames.findGameByName( gameName );
        const isLeader = (gameInstance == null);
		
		// if it doesn't, create it
		if ( gameInstance == null )
		{
			// add game to list of known active games
			gameInstance = activeGames.createGame( gameName );
					
			// set up socket listeners for client actions
			configureSocketSubscriptions( gameInstance );
		}
		
		// create and add ourself
        const newPlayer = gameInstance.createPlayer( player.name, isLeader );
			
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
		
		// TODO: change player attribute
		
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
			// once everyone is ready, begin loading the map data for this game			
			var levelName = "lobby";
			
			// load it on the server and then tell each client to load it for themselves.
			// everyone will need to keep track of the rooms and players
			gameInstance.setMapData( _loadMapData( levelName ) );
	
			io.of( '/' + gameInstance.name ).emit('on_load_map', gameInstance );
		}			
	}
	
	ServerLogic.playerHasFinishedLoadingResources = function( player, socket )
	{
		var gameInstance = activeGames.findGameByPlayerId( player.id );
		
		// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
		if ( gameInstance.verifyMapsLoaded(player) === true )
		{
			console.log('setting starting locations...');
			
			// this will call 'on_player_entered_room'
			_setStartingLocations( gameInstance );
			
			// now start it!
			io.of( '/' + gameInstance.name ).emit('on_start_game', gameInstance );
		}
	}
	
	
	function _setStartingLocations( gameInstance )
	{
		var p = gameInstance.players.length;
		while ( p-- )
		{
			_setStartingLocationForPlayer( gameInstance, gameInstance.players[p] );		
		}
	}
	
	function _setStartingLocationForPlayer( gameInstance, player )
	{
		// find game associated with player
		var gameInstance = activeGames.findGameByPlayerId( player.id );
	
		console.log( 'setting stating location for player ', player.id, ' ', player.name );
		var room = gameInstance.getStartingLocation( player.id );
		
		// starting location sends us to a room and the physical center		
		var teleports_to = 
		{	
		  	"room" : room.id,
		  	"pos" : { 
		  		"x" : 200, 
		  		"y" : 200 
		  	}
		}
			  	
		io.of( '/' + gameInstance.name ).emit('on_player_entered_room', player, teleports_to);	
	}

	/**
	 * Load map data on server to be in sync with the clients which are also loading the map data.
	 */
	function _loadMapData( levelName )
	{
		return JSON.parse(fs.readFileSync('public/data/level_' + levelName + '.json', 'utf8'));
	}
	
	return ServerLogic;
}

