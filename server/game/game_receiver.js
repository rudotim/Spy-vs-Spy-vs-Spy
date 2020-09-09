
module.exports = function (io, gameLogic, gameManager)
{
	const ServerReceiver = function()
	{
	};

	//const gameLogic = require('./game_logic.js')( io, gameManager );

	ServerReceiver.configureSockets = function( socket )
	{

		socket.on('player_has_loaded_map', function( player )
		{
			gameLogic.playerHasFinishedLoadingResources( player );
		});

		// -------------------------------------------------------
		// Game Play Config
		// -------------------------------------------------------

		/**
		 * Received when a player chooses pre-game options like character color.
		 */
		socket.on('player_update_options', function( data )
		{
			gameLogic.playerUpdateOptions( socket, data.roomName, data.player );
		});

		/**
		 * Received when a player chooses pre-game options like character color.
		 */
		socket.on('player_state_update', function( playerStateData )
		{
			gameLogic.playerStateUpdate( socket, playerStateData );
		});

		/**
		 * Received when a player has indicated they are done choosing
		 * options and are ready to start.
		 */
		socket.on('player_is_ready', function( player )
		{
			gameLogic.playerIsReady( player, socket );
		});

		// not really a thing anymore.  get rid of this
		// socket.on('start_pre_game', function()
		// {
		// 	console.log('server received request to start the pre-game');
		//
		// 	chat.emit('on_start_pre_game', null );
		// });

		// This is being moved to chat_receiver
		// socket.on('start_game', function( data )
		// {
		// 	console.log('server received request to start the game');
		//
		// 	gameLogic.startGame( data.roomName );
		// });

		// -------------------------------------------------------
		// Game Play
		// -------------------------------------------------------

		// // join data channel
		// socket.on('on_data', function( spyPos )
		// {
		// 	socket.broadcast.to(gameInstance.name).emit('on_data', spyPos);
		// });
		//

		//
		// socket.on('player_entered_room', function(player, teleports_to)
		// {
		// 	chat.emit('on_player_entered_room', player, teleports_to );
		// });
		//
		// socket.on('player_left_room', function(player, roomId)
		// {
		// 	chat.emit('on_player_left_room', player, roomId );
		// });

	};


	// // set up socket calls for lobby logic.  (join room, leave room, etc...)
	// //cofigureGameSockets();
	//
	// function cofigureGameSockets()
	// {
 	// 	const urlid = '/';
	//
	// 	console.log('attaching GAME IO> joining %o', urlid);
	//
	// 	// create sockets, pass back chat names
     //    const chat = io.of(urlid).on('connection', function(socket)
	// 	{
	// 		console.log('server_receiver> SOCKET CONNECTED TO CLIENT');
	//
	// 		socket.on('disconnect', function ()
	// 		{
	// 			console.log('disconnected player_id=' + socket.player);
	//
	// 			// remove from server list
	// 			//serverLogic.playerHasLeft( socket.player, socket );
	// 		});
	//
	// 		// -------------------------------------------------------
	// 		// Lobby Config
	// 		// -------------------------------------------------------
	//
	// 		/**
	// 		 * Received when a client requests to join a room.
	// 		 * If the room didn't exist, it will be created and the client will join.
	// 		 */
	// 		socket.on('join_room', function( data )
	// 		{
	// 			console.log("player[%o] is joining room[%o]", data.playerId, data.roomName);
	//
	// 			//socket.join( (data.roomName[0] !== '/' ? '/' : '') + data.roomName );
	// 			socket.join( data.roomName );
	//
	// 			// returns a game but we dont' do anything with it?
	// 			serverLogic.joinRoom( data.playerId, data.roomName, socket );
	// 		});
	//
	// 		/**
	// 		 * Received when a client requests to leave a room.
	// 		 *
	// 		 * todo: delete the room if the last user has left
	// 		 */
	// 		socket.on('leave_room', function( data )
	// 		{
	// 			console.log("player[%o] is leaving room [%o]", data.playerId, data.roomName);
	//
	// 			//socket.leave( (data.roomName[0] !== '/' ? '/' : '') + data.roomName );
	// 			socket.leave( data.roomName );
	//
	// 			// returns a game but we dont' do anything with it?
	// 			serverLogic.leaveRoom( data.playerId, data.roomName, socket );
	// 		});
	//
	// 		/**
	// 		 * Received when a client requests a list of the people in a room.
	// 		 */
	// 		socket.on('list_players', function( data )
	// 		{
	// 			console.log("Request to list players in room[%o]", data.roomName);
	//
	// 			serverLogic.listPlayers( data.roomName, socket );
	// 		});
	//
	// 		socket.on('get_room_status', function( data )
	// 		{
	// 			console.log("Request for status in room[%o]", data.roomName);
	//
	// 			serverLogic.getRoomStatus( data.roomName, socket );
	// 		});
	//
	// 		/**
	// 		 * Received when a player successfully joins a room.
	// 		 *
	// 		 * data.playerId
	// 		 * data.roomName
	// 		 */
	// 		socket.on('player_joined', function( data )
	// 		{
	// 			console.log('server got: player_joined');
	//
	// 			//socket.player = player;
	// 			serverLogic.playerHasJoined( data.playerId, data.roomName, socket );
	// 		});
	//
	// 		/**
	// 		 * Received when a player leaves a chat room
	// 		 */
	// 		socket.on('player_left', function( player )
	// 		{
	// 			serverLogic.playerHasLeft( player, socket );
	// 		});
	//
	// 		/**
	// 		 * Received when a player sends a chat message in a chat room
	// 		 */
	// 		socket.on('on_chat', function(data)
	// 		{
	// 			serverLogic.sendChat( data.roomName, data.message, socket );
	// 		});
	//
	// 		// -------------------------------------------------------
	// 		// Game Play Config
	// 		// -------------------------------------------------------
	//
	// 		socket.on('player_update_options', function( playerOptions )
	// 		{
	// 			console.log("got update> ", playerOptions );
	// 			serverLogic.playerUpdateOptions( socket, playerOptions );
	// 		});
	//
	//
	//
	//
	//
	// 		socket.on('player_is_ready', function( player )
	// 		{
	// 			serverLogic.playerIsReady( player, socket );
	// 		});
	//
	// 		socket.on('player_has_loaded_map', function( player )
	// 		{
	// 			serverLogic.playerHasFinishedLoadingResources( player, socket );
	// 		});
	//
	// 		socket.on('start_pre_game', function()
	// 		{
	// 			console.log('server received request to start the pre-game');
	// 			chat.emit('on_start_pre_game', null );
	// 		});
	//
	// 		socket.on('start_game', function( data )
	// 		{
	// 			console.log('server received request to start the game');
	// 			serverLogic.startGame( data.roomName );
	// 		});
	//
	// 		// -------------------------------------------------------
	// 		// Game Play
	// 		// -------------------------------------------------------
	//
	// 		// // join data channel
	// 		// socket.on('on_data', function( spyPos )
	// 		// {
	// 		// 	socket.broadcast.to(gameInstance.name).emit('on_data', spyPos);
	// 		// });
	// 		//
	//
	// 		//
	// 		// socket.on('player_entered_room', function(player, teleports_to)
	// 		// {
	// 		// 	chat.emit('on_player_entered_room', player, teleports_to );
	// 		// });
	// 		//
	// 		// socket.on('player_left_room', function(player, roomId)
	// 		// {
	// 		// 	chat.emit('on_player_left_room', player, roomId );
	// 		// });
	//
	// 	});
	//
     //    return chat;
	// }

	return ServerReceiver;
};




