var express = require('express');
var router = express.Router();

module.exports = function (io, router, gameManager)
{
	const ServerReceiver = function()
	{
	};
	
	const serverLogic = require('./server_logic.js')( io, gameManager );

	// set up socket calls for lobby logic.  (join room, leave room, etc...)
	const serverSocket = configureLobbySockets();

	/**
	 * Called when someone requests to join the server.
	 */
	router.post('/player/create', function(req, res, next)
	{
		const playerName = req.body.playerName;

		try
		{
			// name of game, player to add and IO socket channel
			res.json( serverLogic.createPlayer( playerName ) );
		}
		catch (err)
		{
			console.log('err> %o', err);
			res.status( err ).send({ error: 'You are already in a room, dummy' });
		}
	});

	// /**
	//  * Called when a player has joined a room.  It doesn't matter if that player is the
	//  * first person to join or the last.  If they are the first, a new game will be created
	//  * with that person as the leader.
	//  */
	// router.post('/room/join', function(req, res, next)
	// {
	// 	const gameName = req.body.gameName;
     //    const playerName = req.body.playerName;
	//
	// 	try
	// 	{
	// 		// name of game, player to add and IO socket channel
	// 		res.json( serverLogic.joinRoom( gameName, playerName, configureSocketSubscriptions ) );
	// 	}
	// 	catch (err)
	// 	{
	// 		console.log('err> %o', err);
	// 		res.status( err ).send({ error: 'You are already in a room, dummy' });
	// 	}
	// });
	
	/**
	 * Called when a player has selected a player configuration during the pre-game mode.
	 * Right now, a player configuration consists of just a name.
	 */
	router.post('/player/choose', function(req, res, next) {
		const clientData = req.body;
	
		console.log('calling choose_player> %o', clientData);
	
		const success = serverLogic.choosePlayer(
				req.body.gameId, 
				req.body.player.id, 
				req.body.playerConfig );
	
		res.json( { 'success' : success } );
	});


	function configureLobbySockets()
	{
 		const urlid = '/';
	
		console.log('attachingIO> joining %o', urlid);
	
		// create sockets, pass back chat names
        const chat = io.of(urlid).on('connection', function(socket)
		{
			console.log('server_receiver> SOCKET CONNECTED TO CLIENT');
	
			// join chat room
			//socket.join(gameInstance.name);
			//socket.join("/");

			socket.on('test', function ()
			{
				console.log("got test");
			});

			socket.on('disconnect', function ()
			{
				console.log('disconnected player_id=' + socket.player);
				
				// remove from server list
				serverLogic.playerHasLeft( socket.player, socket );
			});
	
			// -------------------------------------------------------
			// Lobby Config
			// -------------------------------------------------------

			/**
			 * Called when a client requests to create or join a room.
			 */
			socket.on('join_room', function( data )
			{
				console.log("player[%o] is joining room[%o]", data.playerId, data.roomName);

				//socket.join( (data.roomName[0] !== '/' ? '/' : '') + data.roomName );
				socket.join( data.roomName );

				// returns a game but we dont' do anything with it?
				serverLogic.joinRoom( data.playerId, data.roomName, socket );
			});

			socket.on('leave_room', function( data )
			{
				console.log("player[%o] is leaving room [%o]", data.playerId, data.roomName);

				//socket.leave( (data.roomName[0] !== '/' ? '/' : '') + data.roomName );
				socket.leave( data.roomName );

				// returns a game but we dont' do anything with it?
				serverLogic.leaveRoom( data.playerId, data.roomName, socket );
			});


			/**
			 * Received when a player successfully joins a room.
			 * data.playerId
			 * data.roomName
			 */
			socket.on('player_joined', function( data )
			{
				console.log('server got: player_joined');

				//socket.player = player;
				serverLogic.playerHasJoined( data.playerId, data.roomName, socket );
			});
			
			socket.on('player_left', function( player )
			{
				serverLogic.playerHasLeft( player, socket );
			});
			
			socket.on('player_attr_updated', function( player )
			{
				serverLogic.playerAttributeUpdated( player, socket );
			});
			
			// -------------------------------------------------------
			// Game Play Config
			// -------------------------------------------------------			
			
			socket.on('player_is_ready', function( player )
			{
				serverLogic.playerIsReady( player, socket );		
			});
			
			socket.on('player_has_loaded_map', function( player )
			{
				serverLogic.playerHasFinishedLoadingResources( player, socket );
			});
	
			socket.on('start_pre_game', function()
			{
				console.log('server received request to start the pre-game');				
				chat.emit('on_start_pre_game', null );
			});
			
			socket.on('start_game', function( game_id )
			{
				console.log('server received request to start the game');
			});
			
			// -------------------------------------------------------
			// Game Play
			// -------------------------------------------------------
	
			// // join data channel
			// socket.on('on_data', function( spyPos )
			// {
			// 	socket.broadcast.to(gameInstance.name).emit('on_data', spyPos);
			// });
			//
			socket.on('on_chat', function(data)
			{
				console.log("got yo chat! %o", data);
				//io.of(data.roomName).emit("on_chat", data.msg );
				io.sockets.in(data.roomName).emit("on_chat", data.msg );

				//chat.emit("on_chat", data);
				//socket.broadcast.to(gameInstance.name).emit('on_chat', data);
			});
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
							
		});

        return chat;
	}

	return router;
};




