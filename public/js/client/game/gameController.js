
const GameController = function( socket, frontEnd, chatroom, game, player )
{
	const eventCenter = EventDispatcher.getInstance();

	const clientRequest = {};

	// the encapsulation of logic calls to receive data from the server
	const _fromGameServerSocket = fromGameServerSocket( socket, clientRequest );

	// the encapsulation of logic calls to send data to the server
	const _toServer = toGameServerSocket( socket );

	// the core game logic
	const _gameLogic = GameLogic( clientRequest );

	// your player object
	const _player = player;

	// local copy of game data
	//let _gameInstance = null;

	let listeners = [];

	// Property exports:

	clientRequest.player = _player;
	clientRequest.players = chatroom.players;


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
	 * Called when a player updates a property. (name, color, etc...)
	 * @param player Player object
	 */
	clientRequest.sendPlayerUpdateOptions = function( player )
	{
		console.log('sendPlayerUpdateOptions***> ', player);

		const data = {
			roomName : game.chatroom.name,
			player : player
		};

		_toServer.sendPlayerUpdateOptions( socket, data );
	};

	/**
	 * Called when a remote player has updated a property. (name, color, etc...)
	 * @param player Remote Player object
	 */
	clientRequest.onPlayerUpdateOptions = function( player )
	{
		eventCenter.emit('on_player_update_options', player );
	};


	/**
	 * Called when a new player has joined the room we're in.
	 * @param playerId
	 * @param playerName
	 * @param chatRoomName
	 */
	clientRequest.onPlayerJoinedChatRoom = function( playerId, playerName, chatRoomName )
	{
		eventCenter.emit('on_player_joined', playerId, playerName );
	};

	/**
	 * Called when some other player in our room has left.
	 * @param playerId
	 * @param playerName
	 * @param chatRoomName
	 */
	clientRequest.onPlayerLeftChatRoom = function( playerId, playerName, chatRoomName )
	{
		console.log("chatroom players> ", chatroom.players );

		// for ( let p=0; p < chatroom.players.length; p++ )
		// {
		// 	console.log("chatroom player> ", chatroom.players[p] );
		// }
		eventCenter.emit('on_player_left', playerId, playerName );
	};



	/**
	 * Called when a player moves or changes state
	 * @param id
	 * @param x
	 * @param y
	 * @param moving
	 */
	clientRequest.sendPlayerStateUpdate = function( id, x, y, moving )
	{
		//console.log('sendPlayerUpdateState> ', player);

		const playerStateData =
		{
			id : id,
			x : x,
			y : y,
			moving : moving
		};

		const data = {
			roomName : game.chatroom.name,
			playerStateData : playerStateData
		};

		_toServer.sendPlayerStateUpdate( socket, data );
	};

	clientRequest.onPlayerStateUpdate = function( playerStateData )
	{
		eventCenter.emit('on_player_state_update', playerStateData );
	};



	//
	// /**
	//  * Called when a new person has just joined a room.  They will have no idea who
	//  * is in the room unless they receive a complete list from the server.  This
	//  * message is sent only to the one user and not to anyone else.
	//  * @param players
	//  */
	// clientRequest.onListPlayers = function( players )
	// {
	// 	console.log("onListPlayers> %o", players );
	// };
	//

	
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
