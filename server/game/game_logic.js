//var express = require('express');
//var router = express.Router();
const fs = require('fs');


module.exports = function (io, gameManager)
{
	const _gameManager = gameManager;

	let ServerLogic = function()
	{
		console.log('server logic constructor');
	};

	/**
	 * Create a new game.
	 * @param chatroom the chatroom object containing the player starting the game
	 * @returns {*}
	 */
	ServerLogic.createGame = function( chatroom )
	{
		return gameManager.createGame( chatroom );
	};

	/**
	 * Update player options like choosing colors.
	 * @param socket
	 * @param roomName
	 * @param playerOptions
	 */
	ServerLogic.playerUpdateOptions = function( socket, roomName, playerOptions )
	{
		sendToEveryoneInRoom( roomName, "on_player_update_options", playerOptions );
	};

	/**
	 * Called when a player has moved position or changed state.
	 * This will be sent from one player to everyone else in the room.
	 * @param socket
	 * @param data
	 */
	ServerLogic.playerStateUpdate = function( socket, data )
	{
		sendToEveryoneElseInRoom( socket, data.roomName, "on_player_state_update", data.playerStateData );
	};


	ServerLogic.leaveRoom = function( playerId, roomName )
	{
		//const player = chatManager.findPlayerById( playerId );

		const game = gameManager.findGameByName( roomName );

		// disassociate player with room
		//chatManager.removePlayerFromRoom( player, room );
	};



	/**
	 * Send ONLY to the initial sender
	 * @param socket
	 * @param channel
	 * @param data
	 */
	function sendToOurself( socket, channel, data )
	{
		io.to( socket.id ).emit(channel, data);
	}

	/**
	 * Send to each member of the room EXCEPT the initial sender
	 * @param socket
	 * @param channel
	 * @param roomName
	 * @param data
	 */
	function sendToEveryoneElseInRoom( socket, roomName, channel, data )
	{
		socket.to(roomName).emit( channel, data);
	}

	/**
	 * Send to each member of the room INCLUDING the initial sender
	 * @param channel
	 * @param roomName
	 * @param data
	 */
	function sendToEveryoneInRoom( roomName, channel, data )
	{
		io.sockets.in(roomName).emit( channel, data);
	}



	ServerLogic.choosePlayer = function( gameId, playerId, playerConfigJson )
	{
		const current_player = gameManager.findPlayerByGameId( gameId, playerId );

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
		
		let game = gameManager.findGameById( gameId );
		
		console.log('game name> %o', game.name);
		
		// send message to everybody that this player is now off the market
		io.of( '/' + game.name ).emit('on_chosen_player', playerId, current_player.player_def );
		
		return true;
	};



	// /**
	//  * Called when a player successfully joins a room.
	//  * data.playerId
	//  * data.roomName
	//  */
	// ServerLogic.playerHasJoined = function( playerId, roomName, socket )
	// {
	// 	console.log('playerHasJoined> %o', playerId );
	//
	// 	// TODO: We are currently not doing anything with the room name?
	//
	// 	const player = gameManager.findPlayerById( playerId );
	//
	// 	// find game associated with player
	// 	const  game = gameManager.findGameByPlayerId( playerId );
	// 	const serverPlayers = game.players;
	//
	// 	// notify other clients that a player has joined
	// 	socket.broadcast.to(game.name).emit('on_player_joined', serverPlayers, player.name);
	// };
	//
	// ServerLogic.playerHasLeft = function( player, socket )
	// {
	// 	console.log('playerHasLeft> %o', player );
	//
	// 	// find game associated with player
	// 	//let game = gameManager.findGameByPlayerId( player.id );
	//
	// 	//game.removePlayerById( player.id );
	//
	// 	//socket.broadcast.to(game.name).emit('on_player_left', game.players, player);
	// };
	//
	// ServerLogic.playerAttributeUpdated = function( player, socket )
	// {
	// 	console.log('playerAttributeUpdated> %o', player );
	//
	// 	// find game associated with player
	// 	let game = gameManager.findGameByPlayerId( player.id );
	//
	// 	// TODO: change player attribute
	//
	// 	console.log('server[player_attr_updated]> got data : ' + player.name);
	// 	socket.broadcast.to(game.name).emit('on_player_attr_updated', game.players, player);
	// };
	
	ServerLogic.playerIsReady = function( player, socket )
	{
		let game = gameManager.findGameByPlayerId( player.id );
	
		socket.broadcast.to(game.name).emit('on_player_is_ready', player);
	
		// TODO: add something to remember who clicked start
		
		// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
		if ( ++game.players_loaded >= game.players.length )
		{
			// once everyone is ready, begin loading the map data for this game			
			var levelName = "lobby";
			
			// load it on the server and then tell each client to load it for themselves.
			// everyone will need to keep track of the rooms and players
			game.setMapData( _loadMapData( levelName ) );
	
			io.of( '/' + game.name ).emit('on_load_map', game );
		}			
	};
	
	ServerLogic.playerHasFinishedLoadingResources = function( player )
	{
		let game = gameManager.findGameByPlayerId( player.id );
		
		// keep track of players loaded to provide feedback to waiting players as to who is the slow poke
		if ( game.verifyMapsLoaded(player) === true )
		{
			console.log('setting starting locations...');
			
			// this will call 'on_player_entered_room'
			_setStartingLocations( game );
			
			// now start it!
			io.of( '/' + game.name ).emit('on_start_game', game );
		}
	};
	
	
	function _setStartingLocations( game )
	{
		var p = game.players.length;
		while ( p-- )
		{
			_setStartingLocationForPlayer( game, game.players[p] );		
		}
	}
	
	function _setStartingLocationForPlayer( game, player )
	{
		// find game associated with player
		//let game = gameManager.findGameByPlayerId( player.id );
	
		console.log( 'setting stating location for player ', player.id, ' ', player.name );
		var room = game.getStartingLocation( player.id );
		
		// starting location sends us to a room and the physical center		
		var teleports_to = 
		{	
		  	"room" : room.id,
		  	"pos" : { 
		  		"x" : 200, 
		  		"y" : 200 
		  	}
		};
			  	
		io.of( '/' + game.name ).emit('on_player_entered_room', player, teleports_to);	
	}

	/**
	 * Load map data on server to be in sync with the clients which are also loading the map data.
	 */
	function _loadMapData( levelName )
	{
		return JSON.parse(fs.readFileSync('public/data/level_' + levelName + '.json', 'utf8'));
	}
	
	return ServerLogic;
};

