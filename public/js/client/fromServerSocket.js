




const fromServerSocket = function( socket, gameController )
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

        gameController.onPlayerJoinedRoom( data.playerId, data.playerName, data.roomName );
    });

    socket.on('on_player_left', function( data )
    {
        console.log('player left room> ', data );

	    gameController.onPlayerLeftRoom( data.playerId, data.playerName, data.roomName );
    });

	/**
	 * Received when a request is made to list the players in the chat room
	 */
	socket.on('on_list_players', function( data )
	{
		console.log('listing players> %o', data );

		gameController.onListPlayers( data.players );
	});

	// socket.on('on_room_status', function( data )
	// {
	// 	console.log('received status for room> %o', data );
	//
	// 	gameController.onReceiveRoomStatus( data.players, data.gameStarted );
	// });

	socket.on( 'on_chat', function(message)
	{
		console.log('got chat data[' + message + ']');
	});

	socket.on( 'on_start_game', function()
	{
		console.log('SERVER IS STARTING GAME!');
		gameController.onStartGame();
	});
};






