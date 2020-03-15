
const GameController = function( frontEnd, socket )
{
	const clientRequest = {};

	// the encapsulation of logic calls to receive data from the server
	const _fromGameServerSocket = fromGameServerSocket( socket, clientRequest );

	// the encapsulation of logic calls to send data to the server
	const _toServer = toGameServerSocket( socket );

	// the core game logic
	const _gameLogic = GameLogic( clientRequest );

	// your player object
	let _player;

	// local copy of game data
	let _gameInstance = null;

	let listeners = [];

	/**
	 * Called when the leader of a chat room has initiated the start of the game
	 */
	clientRequest.onStartGame = function()
	{
		_gameLogic.onStartGame();
	};


	clientRequest.addListener = function( listenerConfigRequest )
	{
		const listenerConfig = {
			config : listenerConfigRequest,
			id : uuid()
		};

		listeners.push( listenerConfig );

		return listenerConfig.id;
	};

	clientRequest.removeListener = function( listenerConfigId )
	{
		listeners = listeners.filter(
			function(value, index, arr)
			{
				return value.id !== listenerConfigId;
			});
	};

	/**
	 * Called when a new player has joined the room we're in.
	 * @param playerId
	 * @param playerName
	 * @param chatRoomName
	 */
	clientRequest.onPlayerJoinedChatRoom = function( playerId, playerName, chatRoomName )
	{
		// call any interested listeners
		listeners.forEach( listener =>
		{
			listener.config.forEach( cfg =>
			{
				if ( cfg.channel === "on_player_joined" )
				{
					cfg.callback(cfg._this, playerId, playerName);
				}
			});
		});
	};

	/**
	 * Called when some other player in our room has left.
	 * @param playerId
	 * @param playerName
	 * @param chatRoomName
	 */
	clientRequest.onPlayerLeftChatRoom = function( playerId, playerName, chatRoomName )
	{
		// call any interested listeners
		listeners.forEach( listener =>
		{
			listener.config.forEach( cfg =>
			{
				if ( cfg.channel === "on_player_left" )
				{
					cfg.callback(cfg._this, playerId, playerName);
				}
			});
		});
	};

	/**
	 * Called when a new person has just joined a room.  They will have no idea who
	 * is in the room unless they receive a complete list from the server.  This
	 * message is sent only to the one user and not to anyone else.
	 * @param players
	 */
	clientRequest.onListPlayers = function( players )
	{
		console.log("onListPlayers> %o", players );
	};




	
	/**
	 * Pop-up the options (player selection) modal window
	 */
	clientRequest.showGameOptions = function()
	{
		_gameLogic.showGameOptions();
	};
	
	clientRequest.triggerPlayerIsReady = function( player )
	{
		_socket.emit( 'player_is_ready', player );	
	};

	clientRequest.triggerPlayerLoadedMap = function( player )
	{
		_socket.emit( 'player_has_loaded_map', player );	
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
		_socket.emit('player_entered_room', player, teleports_to );
	};
	
	clientRequest.sendPlayerLeftRoom = function( player, roomId )
	{
		_socket.emit('player_left_room', player, roomId );
	};

	clientRequest.sendPosUpdate = function( spy )
	{
		if ( spy === undefined )
			return;
		
		_socket.emit('on_data', spy.getPos() );
	};

	clientRequest.sendStopUpdate = function( spy )
	{
		const pos = spy.getPos();
		pos.extra = 'stop';

		_socket.emit( 'on_data', pos );
	};

	return clientRequest;
};
