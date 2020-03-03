




const fromServerSocket = function( socket, gameController )
{
	console.log("On-call events registered for socket");
    //console.log('client joining ' + urlid + '/[' + gameInstance.datachannel + ']');

    // initialize socket to server and establish communication callback channels
    //socket = io( urlid );

    socket.on('connection', function()
    {
        console.log('CONNECTED TO SERVER');
    });

    // -------------------------------------------------------
    // Lobby Config
    // -------------------------------------------------------

    // -- Lobby callbacks from server -----------------------------------------------------

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
	 * Received when a request is made to list the players in the room
	 */
	socket.on('on_list_players', function( data )
	{
		console.log('listing players> %o', data );

		gameController.onListPlayers( data.players );
	});

	socket.on( 'on_chat', function(message)
	{
		console.log('got chat data[' + message + ']');
	});

	socket.on( 'on_start_game', function()
	{
		console.log('SERVER IS STARTING GAME!');
		gameController.onStartGame();
	});

    // /**
    //  * The backend told us someone updated some player property
    //  */
    // socket.on('on_player_attr_updated', function( serverPlayers, updatedPlayer )
    // {
    //     console.log('on_player_attr_updated ' + serverPlayers);
    //
    //     // find the player
    //     let p = gameLogic.getPlayer();
    //     if ( p.player_id === updatedPlayer.player_id )
    //         gameLogic.setPlayer( p );
    //
    //     // redraw room members
    //     frontEnd.updateRoomListUI( serverPlayers );
    //
    //     // update any player data
    //     //_updatePlayerOnServerAttr( serverPlayers );
    // });

    // -------------------------------------------------------
    // Game Play Config
    // -------------------------------------------------------

    socket.on('on_chosen_player', function( player_id, player_config )
    {
        console.log('someone has chosen a player> %o %o', player_id, player_config );

        //gameLogic.onChoosePlayer( player_id, player_config );
    });

    socket.on( 'on_player_is_ready', function( player_id )
    {
        console.log('on_player_ready');
        //gameLogic.onPlayerReady( player_id );
    });

    socket.on( 'on_load_map', function( gameInstance )
    {
        console.log('on_load_map');
        //gameLogic.onLoadMapData( gameInstance );
    });

    socket.on( 'on_game_loading', function( game_loading_pct )
    {
        console.log('on_game_loading');
        //gameLogic.onGameLoading( game_loading_pct );
    });

    // socket.on( 'on_start_game', function( gameInstance )
    // {
    //     console.log('SERVER IS STARTING OFFICIAL GAME!');
    //     gameLogic.onStartGame( gameInstance, gameLogic.getPlayer() );
    // });

    // -------------------------------------------------------
    // Game Play
    // -------------------------------------------------------

    socket.on( 'on_data', function( spyPos )
    {
        // update spy with data
        gameLogic.updatePlayerPos( spyPos );
    });

    socket.on( 'on_player_entered_room', function( player, room )
    {
        gameLogic.onPlayerEnteredRoom( player, room );
    });

    socket.on( 'on_player_left_room', function( player, room )
    {
        gameLogic.onPlayerLeftRoom( player, room );
    });
};






