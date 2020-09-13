const fs = require('fs');


module.exports = function (io, chatManager, gameManager, gameLogic)
{

	let ServerLogic = function()
	{
		console.log('server logic constructor');
	};

	/**
	 * Create a new player based on their name.
	 */
	ServerLogic.createPlayer = function( playerName )
	{
		if ( chatManager.findPlayerByName(playerName) )
		{
			throw('Username already exists');
		}

		// create and add ourself
		const newPlayer = chatManager.createPlayer( playerName );

		// return data to ourself
		return {
			"playerId" : newPlayer.id
		}
	};

	ServerLogic.deletePlayer = function( playerId )
	{
		chatManager.deletePlayer( playerId );
	};

	/**
	 * Join a room.  This will create the room and add you to it if it did not exist.
	 * If the room did not exist, you will be marked as the leader of the room.
	 * That means you can perform admin actions like starting the game,
	 * removing users and changing admin properties.
	 */
	ServerLogic.joinRoom = function( playerId, roomName, socket )
	{
		const player = chatManager.findPlayerById( playerId );

		const room = chatManager.getOrCreateRoomByName( roomName );

		// associate player with room
		chatManager.addPlayerToRoom( player, room );

		let data =
		{
			"playerId" : playerId,
			"playerName" : player.name,
			"roomName" : roomName
		};

		// Send to everone else
		sendToEveryoneElseInRoom(socket, data.roomName, "on_player_joined", data );
	};


	/**
	 * Leave a room.  If successful, the player will be left in limbo.
	 * You will need to call joinRoom afterwards.
	 * @param playerId
	 * @param roomName
	 * @param socket
	 */
	ServerLogic.leaveRoom = function( playerId, roomName, socket )
	{
		const player = chatManager.findPlayerById( playerId );

		const room = chatManager.findRoomByName( roomName );

		// disassociate player with room
		chatManager.removePlayerFromRoom( player, room );

		//gameLogic.leaveRoom( playerId, roomName );

		let data =
			{
				"playerId" : playerId,
				"playerName" : player.name,
				"roomName" : roomName
			};

		// Send to everone else
		sendToEveryoneElseInRoom(socket, data.roomName, "on_player_left", data );
	};

	/**
	 * Return list of all players in the room with name roomName
	 * @param roomName name of chat room
	 * @param socket socket connection to client
	 */
	ServerLogic.listPlayers = function( roomName, socket )
	{
		const players = chatManager.findPlayersInRoom( roomName );

		let data =
		{
			"players" : players,
		};

		// send only to ourself
		console.log("Sending player list to ourself in room %o", roomName );
		sendToOurself( socket, "on_list_players", data );
	};

	/**
	 * Return list of all chat rooms
	 * @param socket socket connection to client
	 */
	ServerLogic.listRooms = function( socket )
	{
		// send only to ourself
		console.log("Sending room list to ourself" );
		sendToOurself( socket, "on_list_rooms", chatManager.getAllRooms() );
	};

	/**
	 * Return the current status of the room.
	 * This includes a list of each player
	 * and whether or not a game has been started
	 * @param roomName
	 * @param socket
	 */
	ServerLogic.getRoomStatus = function( roomName, socket )
	{
		const players = chatManager.findPlayersInRoom( roomName );

		const game = gameManager.findGameByName( roomName );

		let data =
			{
				"gameStarted" : game !== undefined,
				"players" : players,
			};

		// send only to ourself
		sendToOurself( socket, "on_room_status", data );
	};

	/**
	 * Send this chat message to everyone else in the chat room
	 * @param roomName name of chat room
	 * @param message text content to send to the other users in the room
	 * @param socket socket connection to client
	 */
	ServerLogic.sendChat = function( roomName, message, socket )
	{
		// Send to everone else
		sendToEveryoneElseInRoom(socket, roomName, "on_chat", message );
	};

	/**
	 * Create and start a new game for the room specified by roomName.
	 * All players will receive a message to start.
	 * @param roomName
	 */
	ServerLogic.startGame = function( roomName )
	{
		const chatroom = chatManager.findRoomByName( roomName );

		// create game object in game obj manager
		const game = gameManager.createGame( chatroom );

		// save reference to game in chatroom

		// save reference to chatroom in game

		// Send to everone else
		sendToEveryoneInRoom( roomName, "on_start_game", game );
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









	
	ServerLogic.playerIsReady = function( player, socket )
	{
		let game = chatManager.findGameByPlayerId( player.id );
	
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
	
	ServerLogic.playerHasFinishedLoadingResources = function( player, socket )
	{
		let game = chatManager.findGameByPlayerId( player.id );
		
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

