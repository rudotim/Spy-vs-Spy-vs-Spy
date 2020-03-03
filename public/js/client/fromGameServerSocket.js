

const fromGameServerSocket = function( socket, gameController )
{
	// socket.on( 'on_start_game', function()
	// {
	// 	console.log('SERVER IS STARTING GAME!');
	// 	gameLogic.onStartGame();
	// });

    // -------------------------------------------------------
    // Game Play Config
    // -------------------------------------------------------

    socket.on('on_chosen_player', function( player_id, player_config )
    {
        console.log('someone has chosen a player> %o %o', player_id, player_config );

        gameLogic.onChoosePlayer( player_id, player_config );
    });

    socket.on( 'on_player_is_ready', function( player_id )
    {
        console.log('on_player_ready');
        gameLogic.onPlayerReady( player_id );
    });

    socket.on( 'on_load_map', function( gameInstance )
    {
        console.log('on_load_map');
        gameLogic.onLoadMapData( gameInstance );
    });

    socket.on( 'on_game_loading', function( game_loading_pct )
    {
        console.log('on_game_loading');
        gameLogic.onGameLoading( game_loading_pct );
    });

    // socket.on( 'on_start_game', function( gameInstance )
    // {
    //     console.log('SERVER IS STARTING OFFICIAL GAME!');
    //     gameLogic.onStartGame( gameInstance, gameLogic.getPlayer() );
    // });

    // -------------------------------------------------------
    // Game Play
    // -------------------------------------------------------

    socket.on( 'on_chat', function(msg)
    {
        console.log('got chat data[' + msg + ']');
    });

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
