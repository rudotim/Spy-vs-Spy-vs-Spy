
const toGameServerSocket = function( socket )
{
	let clientRequest = {};

	// -------------------------------------------------------
	// Game Play Setup
	// -------------------------------------------------------

	clientRequest.sendPlayerUpdateOptions = function( socket, data )
	{
		socket.emit( 'player_update_options', data );
	};

	clientRequest.triggerPlayerIsReady = function( player )
	{
		socket.emit( 'player_is_ready', player );
	};

	clientRequest.sendPlayerStateUpdate = function( socket, playerStateData )
	{
		//if ( spy === undefined )
		//	return;

		socket.emit('player_state_update', playerStateData );
	};

	// -------------------------------------------------------
	// todo: Still need these to fix due to refactoring
	// -------------------------------------------------------

	clientRequest.triggerPlayerLoadedMap = function( player )
	{
		socket.emit( 'player_has_loaded_map', player );
	};

	clientRequest.triggerStartPreGame = function()
	{
		socket.emit( 'start_pre_game', null );
	};

	clientRequest.triggerStartGame = function()
	{
		socket.emit( 'start_game', _gameInstance.game_id );
	};

	clientRequest.sendPlayerEnteredRoom = function( player, teleports_to )
	{
		socket.emit('player_entered_room', player, teleports_to );
	};

	clientRequest.sendPlayerLeftRoom = function( player, roomId )
	{
		socket.emit('player_left_room', player, roomId );
	};

	clientRequest.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';

		socket.emit( 'on_data', pos );
	};
		
	return clientRequest;
};
