


const fromChatServerSocket = function( socket, chatController )
{
    socket.on('connection', function()
    {
        console.log('CONNECTED TO SERVER');
    });

    // -------------------------------------------------------
    // Lobby Config
    // -------------------------------------------------------

 	/**
	 * 	Received when a player has joined a room
	 */
    socket.on('on_player_joined', function( data )
    {
		// let data =
		// 	{
		// 		"playerId" : playerId,
		// 		"playerName" : player.name,
		// 		"gameName" : gameName
		// 	};

        console.log('on player joined room> %o', data );

        chatController.onPlayerJoinedChatRoom( data.playerId, data.playerName, data.roomName );
    });

    socket.on('on_player_left', function( data )
    {
        console.log('player left room> ', data );

	    chatController.onPlayerLeftChatRoom( data.playerId, data.playerName, data.roomName );
    });

	/**
	 * Received when a request is made to list the players in the chat room
	 */
	socket.on('on_list_players', function( data )
	{
		console.log('listing players> %o', data );

		chatController.onListPlayers( data.players );
	});

	/**
	 * Received when a request is made to list the available chat rooms
	 */
	socket.on('on_list_rooms', function( data )
	{
		console.log('listing rooms> %o', data );

		chatController.onListRooms( data );
	});

	socket.on('on_room_status', function( data )
	{
		console.log('received status for room> %o', data );

		chatController.onReceiveRoomStatus( data.players, data.gameStarted );
	});

	socket.on( 'on_chat', function(message)
	{
		console.log('got chat data[' + message + ']');
	});

	//moved to fromGameServer - delete this when working
	socket.on( 'on_start_game', function( game )
	{
		console.log('SERVER IS STARTING GAME!');
		chatController.onStartGame( game );
	});
};

