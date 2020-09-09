

const fromGameServerSocket = function( socket, gameController )
{
    socket.on('on_player_update_options', function( playerOptions )
    {
	    gameController.onPlayerUpdateOptions( playerOptions );
    });

	socket.on('on_player_state_update', function( playerStateData )
	{
		gameController.onPlayerStateUpdate( playerStateData );
	});

    socket.on( 'on_player_is_ready', function( player_id )
    {
        console.log('on_player_ready');
	    gameController.onPlayerReady( player_id );
    });

    socket.on( 'on_load_map', function( gameInstance )
    {
        console.log('on_load_map');
	    gameController.onLoadMapData( gameInstance );
    });

    socket.on( 'on_game_loading', function( game_loading_pct )
    {
        console.log('on_game_loading');
	    gameController.onGameLoading( game_loading_pct );
    });

    // -------------------------------------------------------
    // Game Play
    // -------------------------------------------------------

    socket.on( 'on_data', function( spyPos )
    {
        // update spy with data
	    gameController.updatePlayerPos( spyPos );
    });

    socket.on( 'on_player_entered_room', function( player, room )
    {
	    gameController.onPlayerEnteredRoom( player, room );
    });

    socket.on( 'on_player_left_room', function( player, room )
    {
	    gameController.onPlayerLeftRoom( player, room );
    });
};
