
const GameController = function( socket, frontEnd, game, player )
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
	//const _player = player;

	let listeners = [];

	// Property exports:

	clientRequest.game = game;
	clientRequest.player = player;
	clientRequest.players = game.chatroom.players;


	/**
	 * Called when the leader of a chat room has initiated the start of the game
	 */
	clientRequest.onStartGame = function()
	{
		_toServer.setGame( game );

		console.log("ON START GAME> %o", game );

		console.log("players> %o", this.players );

		this.sendPlayerJoinedGame( this.player.id );

		_gameLogic.onStartGame();
	};

	clientRequest.getOptions = function()
	{
		return game.options;
	};

	/**
	 * Called when a player updates a property. (name, color, etc...)
	 * @param playerId
	 * @param color
	 * @param ready
	 */
	clientRequest.sendPlayerUpdateOptions = function( playerId, color, ready )
	{
		const playerUpdateOptions = {
			id : playerId,
			color : color,
			ready : ready
		};

		console.log('sendPlayerUpdateOptions> ', playerUpdateOptions);

		_toServer.sendPlayerUpdateOptions( socket, playerUpdateOptions );
	};

	/**
	 * Called when a remote player has updated a property. (name, color, etc...)
	 * @param playerUpdateOptions Remote Player object
	 */
	clientRequest.onPlayerUpdateOptions = function( playerUpdateOptions )
	{
		eventCenter.emit('on_player_update_options', playerUpdateOptions );
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
		console.log("player left chatroom> %o %o", playerName, playerId );

		eventCenter.emit('on_player_left', playerId, playerName );
	};


	clientRequest.sendPlayerJoinedGame = function( playerId )
	{
		const joinData = {
			playerId : playerId
		};

		console.log('sendPlayerJoinedGame> ', joinData);

		_toServer.sendPlayerJoinedGame( socket, joinData );
	};

	clientRequest.onPlayerJoinedGame = function( player )
	{
		console.log("onPlayerJoinedGame> %o", player );

		this.addLocalPlayer( player );

		eventCenter.emit('on_player_joined_game', player );
	};

	clientRequest.addLocalPlayer = function( newPlayer )
	{
		this.players.push( newPlayer );
	};
	// clientRequest.updateLocalPlayer = function( newPlayer )
	// {
	// 	const player = this.players.find( p => p.id === newPlayer.id );
	//
	// 	if ( player !== undefined )
	// 	{
	// 		player.game = newPlayer.game;
	// 	}
	// 	else
	// 		console.error("Failed to update local player> %o", newPlayer );
	// };


	/**
	 * Called when a player moves or changes state
	 * @param id
	 * @param x
	 * @param y
	 * @param moving
	 * @param endFrame
	 */
	clientRequest.sendPlayerStateUpdate = function( id, x, y, moving, endFrame )
	{
		const playerStateData =
		{
			id : id,
			x : x,
			y : y,
			moving : moving,
			endFrame : endFrame
		};

		// const data = {
		// 	roomName : game.chatroom.name,
		// 	playerStateData : playerStateData
		// };

		_toServer.sendPlayerStateUpdate( socket, playerStateData );
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

	// clientRequest.sendPosUpdate = function( spy )
	// {
	// 	if ( spy === undefined )
	// 		return;
	//
	// 	_socket.emit('on_data', spy.getPos() );
	// };

	clientRequest.sendStopUpdate = function( spy )
	{
		const pos = spy.getPos();
		pos.extra = 'stop';

		_socket.emit( 'on_data', pos );
	};

	return clientRequest;
};
