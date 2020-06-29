
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

	// clientRequest.choosePlayer = function( player, playerIndex, playerConfig, playerChosenCallback )
	// {
	// 	const clientData = {
	// 			player : player,
	// 			playerConfig : playerConfig,
	// 			gameId : _gameInstance.game_id
	// 	};
	//
	// 	$.ajax({
	// 		type : 'post',
	// 		url : '/player/choose/',
	// 		data : JSON.stringify(clientData),
	// 		contentType : "application/json",
	// 		success : function(data) {
	//
	// 			console.log(data);
	// 			playerChosenCallback( playerIndex, playerConfig, data.success );
	// 		},
	// 		error : function(err) {
	// 			console.error('ERROR! ' + err.responseText);
	// 			console.error(err);
	//
	// 			//playerChosenCallback( playerIndex, false );
	// 		}
	// 	});
	// };



	// -------------------------------------------------------
	// Game Play
	// -------------------------------------------------------

	clientRequest.sendPlayerEnteredRoom = function( player, teleports_to )
	{
		socket.emit('player_entered_room', player, teleports_to );
	};

	clientRequest.sendPlayerLeftRoom = function( player, roomId )
	{
		socket.emit('player_left_room', player, roomId );
	};

	clientRequest.sendPosUpdate = function( spy )
	{
		if ( spy === undefined )
			return;

		socket.emit('on_data', spy.getPos() );
	};

	clientRequest.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';

		socket.emit( 'on_data', pos );
	};
		
	return clientRequest;
};
