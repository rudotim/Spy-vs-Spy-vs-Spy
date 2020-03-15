




const GameController = function( frontEnd )
{
	const clientRequest = {};
	const LOBBY = "/";
	const _toServerHttp = toServerHttp();

	// your player object
	let _player;

	// communication socket to server
	let _socket;

	// the name of the chat room that you're currently in
	let currentRoomName;

	// the encapsulation of logic calls to receive data from the server
	let _toClient;

	let _fromGameServerSocket;

	// the encapsulation of logic calls to send data to the server
	let _toServer;

	// the core game logic
	let _gameLogic;

	let _chatroom;

	// ---------------
	// local copy of game data
	let _gameInstance = null;

	let listeners = [];


	init();

	function init()
	{
		// gameControl
		_gameLogic = GameLogic( clientRequest );
	}

	// -------------------------------------------------------
	// Lobby Config
	// -------------------------------------------------------

	/**
	 * Create a new player on the server with the supplied name
	 * @param newPlayerName name of the new player
	 */
	clientRequest.createPlayer = function( newPlayerName )
	{
		_toServerHttp.createPlayer( newPlayerName )
			.then(data =>
			{
				console.log("Created player [" + newPlayerName + "] with id: %o", data.playerId);

				// upon sucessful creation of a new player, save a reference
				// to the player id and dump the player into the default room (lobby)
				_player = data.playerId;

				this.joinRoom( LOBBY );
			})
			.catch(error => {
				console.log("Bzzp - error adding player: " + error);
			});
	};

	/**
	 * Join a new chat room.  Joining a new room automatically causes the user to leave their old room.
	 * @param newRoomName
	 * @returns {*}
	 */
	clientRequest.joinRoom = function( newRoomName )
	{
		// add '/' if it was missing
		if ( currentRoomName === undefined )
		{
			console.log('Joining room: lobby');
			_socket = io(newRoomName);

			_toClient = fromServerSocket( _socket, clientRequest );

			_toServer = toServerSocket( _socket );

			_toServer.joinRoom( _player, newRoomName, _socket );
		}
		else
		{
			console.log('Player %o joining room: ', _player, newRoomName);

			// leave old room
			_toServer.leaveRoom( _player, currentRoomName, _socket );

			// join new room
			_toServer.joinRoom( _player, newRoomName, _socket );
		}

		// Issue: _chatroom is created new each time. so it can't have the gameStarted flag.  boyoyoyng!

		// todo: create game instance so that we can locally add players and stuff
		_chatroom = {
			name : newRoomName,
			players : [ _player ]
		};

		// list players to find out who is here
		_toServer.getRoomStatus( newRoomName, _socket );

		currentRoomName = newRoomName;

		return _socket;
	};


	// const cfgRequest = [
	// 	{
	// 		channel : "onplayerjoined",
	// 		callback : ()
	// 	}
	// ];

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
	clientRequest.onPlayerJoinedRoom = function( playerId, playerName, chatRoomName )
	{
		// todo: wrap in logic to control creation and structure
		_chatroom.players.push(
			{
				name : playerName,
				id : playerId
			}
		);

		frontEnd.updateRoomListUI( _chatroom.players );

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
	clientRequest.onPlayerLeftRoom = function( playerId, playerName, chatRoomName )
	{
		// todo: wrap in logic to control creation and structure
		_chatroom.players = _chatroom.players.filter(
			function(value, index, arr)
			{
				return value.id !== playerId;
			});

		frontEnd.updateRoomListUI( _chatroom.players );
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

		_chatroom.players = players;

		frontEnd.updateRoomListUI( players );
	};

	/**
	 * Called when a new person has just joined a room.  This callback gives the new
	 * user the basic information they need to know about what is happening in this room.
	 *
	 * @param players
	 * @param gameStarted
	 */
	clientRequest.onReceiveRoomStatus = function( players, gameStarted )
	{
		console.log("onReceiveRoomStatus players> %o", players );
		console.log("onReceiveRoomStatus gameStarted> %o", gameStarted );

		_chatroom.players = players;
		_chatroom.gameStarted = gameStarted;

		frontEnd.updateRoomListUI( players );

		if ( _chatroom.gameStarted === true )
		{
			// the game has already started!  start it for the new guy!
			this.onStartGame();
		}
	};

	/**
	 * Called when a user sends chat text.
	 * @param message text content to send to the other users in the room
	 */
	clientRequest.sendChat = function( message )
	{
		_toServer.sendChat( currentRoomName, message, _socket );
	};

	/**
	 * List any on-going chat rooms which you can join
	 */
	clientRequest.listGames = function()
	{
		console.error('listing games has not yet been implemented');
	};


	
	// -------------------------------------------------------
	// Game Play Setup
	// -------------------------------------------------------

	/**
	 * Called when you wish to start the game.
	 * todo: this should only work if you're the leader.
	 */
	clientRequest.triggerStartGame = function()
	{
		_toServer.startGame( currentRoomName, _socket );
	};

	/**
	 * Called when the leader of a chat room has initiated the start of the game
	 */
	clientRequest.onStartGame = function()
	{
		// initiate the logic container for our game specific stuff
		_gameLogic = new GameLogic( clientRequest, _player );

		// start listening for game specific events
		_fromGameServerSocket = new fromGameServerSocket(_socket, _gameLogic, frontEnd);

		_gameLogic.onStartGame();
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


	// clientRequest.triggerStartPreGame = function()
	// {
	// 	_socket.emit( 'start_pre_game', null );
	// };

	
	clientRequest.choosePlayer = function( player, playerIndex, playerConfig, playerChosenCallback )
	{
		const clientData = {
				player : player,
				playerConfig : playerConfig,
				gameId : _gameInstance.game_id
		};

		$.ajax({
			type : 'post',
			url : '/player/choose/',
			data : JSON.stringify(clientData),
			contentType : "application/json",
			success : function(data) {
				
				console.log(data);				
				playerChosenCallback( playerIndex, playerConfig, data.success );
			},
			error : function(err) {
				console.error('ERROR! ' + err.responseText);
				console.error(err);
				
				//playerChosenCallback( playerIndex, false );
			}
		});
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

	function uuid()
	{
		var dt = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (dt + Math.random()*16)%16 | 0;
			dt = Math.floor(dt/16);
			return (c=='x' ? r :(r&0x3|0x8)).toString(16);
		});
		return uuid;
	}

	return clientRequest;
};

let frontEnd = toFrontEnd();

const gameControl = GameController( frontEnd );



