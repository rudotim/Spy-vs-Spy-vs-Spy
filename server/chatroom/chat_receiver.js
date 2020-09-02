const express = require('express');
const router = express.Router();

module.exports = function (io, router, chatLogic, chatManager, gameReceiver)
{
	const ServerReceiver = function()
	{
	};
	
	//const chatLogic = require('./chat_logic.js')( io, chatManager );

	// set up socket calls for lobby logic.  (join room, leave room, etc...)
	configureLobbySockets();

	/**
	 * Called when someone requests to join the server.
	 */
	router.post('/player/create', function(req, res, next)
	{
		const playerName = req.body.playerName;

		try
		{
			// name of game, player to add and IO socket channel
			res.json( chatLogic.createPlayer( playerName ) );
		}
		catch (err)
		{
			console.log('err> %o', err);
			res.status( 400 ).send({ error: err });
		}
	});

	function configureLobbySockets()
	{
 		const urlid = '/';
	
		console.log('attaching CHAT IO> joining %o', urlid);

		const allSockets = [];

		// create sockets, pass back chat names
        const chat = io.of(urlid).on('connection', function(socket)
		{
			allSockets.push( socket );

			console.log('server_receiver> SOCKET CONNECTED TO CLIENT');

			gameReceiver.configureSockets( socket );

			socket.on('disconnect', function ()
			{
				const socketIndex = allSockets.indexOf(socket);
				const currentSocket = allSockets[ socketIndex ];

				console.log('disconnected socket: ', currentSocket.playerId);
				
				// remove from server list
				chatLogic.playerHasLeft( socket, currentSocket.roomName, currentSocket.playerId );
			});
	
			// -------------------------------------------------------
			// Lobby Config
			// -------------------------------------------------------

			/**
			 * Received when a client requests to join a room.
			 * If the room didn't exist, it will be created and the client will join.
			 */
			socket.on('join_room', function( data )
			{
				const socketIndex = allSockets.indexOf(socket);
				const currentSocket = allSockets[ socketIndex ];
				currentSocket.playerId = data.playerId;
				currentSocket.roomName = data.roomName;

				console.log("player[%o] is joining room[%o]", data.playerId, data.roomName);

				socket.join( data.roomName );

				// returns a game but we dont' do anything with it?
				chatLogic.joinRoom( data.playerId, data.roomName, socket );
			});

			/**
			 * Received when a client requests to leave a room.
			 *
			 * todo: delete the room if the last user has left
			 */
			socket.on('leave_room', function( data )
			{
				console.log("player[%o] is leaving room [%o]", data.playerId, data.roomName);

				socket.leave( data.roomName );

				// returns a game but we dont' do anything with it?
				chatLogic.leaveRoom( data.playerId, data.roomName, socket );
			});

			/**
			 * Received when a client requests a list of the people in a room.
			 */
			socket.on('list_players', function( data )
			{
				console.log("Request to list players in room[%o]", data.roomName);

				chatLogic.listPlayers( data.roomName, socket );
			});

			/**
			 *
			 */
			socket.on('get_room_status', function( data )
			{
				console.log("Request for status in room[%o]", data.roomName);

				chatLogic.getRoomStatus( data.roomName, socket );
			});


			socket.on('start_game', function( data )
			{
				console.log('server received request to start the game');

				chatLogic.startGame( data.roomName );
			});

			// /**
			//  * Received when a player successfully joins a room.
			//  *
			//  * data.playerId
			//  * data.roomName
			//  */
			// socket.on('player_joined', function( data )
			// {
			// 	console.log('server got: player_joined');
			//
			// 	//socket.player = player;
			// 	chatLogic.playerHasJoined( data.playerId, data.roomName, socket );
			// });
			//
			// /**
			//  * Received when a player leaves a chat room
			//  */
			// socket.on('player_left', function( player )
			// {
			// 	chatLogic.playerHasLeft( player, socket );
			// });

			/**
			 * Received when a player sends a chat message in a chat room
			 */
			socket.on('on_chat', function(data)
			{
				chatLogic.sendChat( data.roomName, data.message, socket );
			});

		});

        return chat;
	}

	return router;
};




