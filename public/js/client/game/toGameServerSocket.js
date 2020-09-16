
const toGameServerSocket = function( socket )
{
	let clientRequest = {};

	clientRequest.setGame = function( game )
	{
		this.game = game;
	};

	// -------------------------------------------------------
	// Game Play Setup
	// -------------------------------------------------------

	clientRequest.sendPlayerUpdateOptions = function( socket, playerUpdateData )
	{
		let dataWrapper = {
			gameId : this.game.id,
			data : playerUpdateData
		};

		socket.emit( 'player_update_options', dataWrapper );
	};

	clientRequest.triggerPlayerIsReady = function( player )
	{
		socket.emit( 'player_is_ready', player );
	};

	clientRequest.sendPlayerStateUpdate = function( socket, playerStateData )
	{
		let dataWrapper = {
			gameId : this.game.id,
			data : playerStateData
		};

		socket.emit('player_state_update', dataWrapper );
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
