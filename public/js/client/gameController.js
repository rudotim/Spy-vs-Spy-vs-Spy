




const GameController = function( frontEnd, gameLogic )
{
	let clientRequest = {};

	// your player object
	let _player;

	// communication socket to server
	let _socket;

	const LOBBY = "/";
	let currentRoomName;

	// local copy of game data
	let _gameInstance = null;
		
	// encapsulated methods to perform common game logic
	//var _gameLogic = gameLogic;

	//const _socket = io( LOBBY );

	const _toServerHttp = toServerHttp();

	let _toClient;

	let _toServer;

	clientRequest.createPlayer = function( newPlayerName )
	{
		_toServerHttp.createPlayer( newPlayerName )
			.then(data =>
			{
				console.log("Created player [" + newPlayerName + "] with id: %o", data.playerId);
				_player = data.playerId;

				_joinRoom( LOBBY );

				// const socket = io( LOBBY );
				//
				// _toClient = fromServerSocket( data.socket, gameLogic, frontEnd );
				//
				// _toServer = toServerSocket( data.socket );
			})
			.catch(error => {
				console.log("Bzzp - error adding player: " + error);
			});
	};

	/**
	 * Join or create a room with name
	 */
	clientRequest.joinRoom = function( newRoomName )
	{
		// precede with slash
		//const newRoomUrl = "/" + newRoomName;

		//let socketRoom = io("/" + newRoomName);

		console.log('attempting to join room [' + newRoomName + ']');

		// change rooms from old to new
		//_socket = changeRooms( currentRoomName, newRoomName );

		//_toServer.joinRoom( _player, newRoomName, _socket );

		_joinRoom( newRoomName );
	};

	// const changeRooms = function ( oldRoomName, newRoomName )
	// {
	// 	// leave existing room if it was a valid room
	// 	if ( currentRoomName !== undefined )
	// 	{
	// 		console.log("leaving old room %o", oldRoomName );
	//
	// 		//_toServer.leaveRoom(oldRoomName);
	//
	// 		// tell server to change our socket to the new toom
	//
	// 	}
	// 	else
	// 		console.log("no need to leave old room");
	//
	// 	// join new
	// 	return _joinRoom( newRoomName );
	// };

	const _joinRoom = function( roomName )
	{
		// add '/' if it was missing
		if ( currentRoomName === undefined )
		{
			console.log('Joining room: lobby');
			//_socket = io((roomName[0] !== '/' ? '/' : '') + roomName);
			_socket = io(roomName);

			_toClient = fromServerSocket(_socket, gameLogic, frontEnd);

			_toServer = toServerSocket(_socket);

			_toServer.joinRoom( _player, roomName, _socket );
		}
		else
		{
			console.log('Player %o joining room: ', _player, roomName);

			// leave old room
			_toServer.leaveRoom( _player, currentRoomName, _socket );

			// join new room
			_toServer.joinRoom( _player, roomName, _socket );
		}

		currentRoomName = roomName;

		return _socket;
	};

	const joinCB = function()
	{
		console.log("JOINED");
	};

	// let _toClient;// = fromServerSocket( socket, gameLogic, frontEnd );
	// let _toServer;

	// let _initSocket = function( urlid )
	// {
	// 	return io( urlid );
	// };

	//var urlid = '/' + gameInstance.name;
	//_initSocket("");

	let _onJoinRoomSuccess = function( gameInstance, player )
	{
		const urlid = '/' + gameInstance.name;

		console.log('client joining ' + urlid + '/[' + gameInstance.datachannel + ']');

		let socket = _initSocket( urlid );

		_toClient = fromServerSocket( socket, gameLogic, frontEnd );

		_toServer = toServerSocket( socket );

		// save our player in gameLogic
		//gameLogic.setPlayer( player );
		
		//_gameInstance = gameInstance;
				
		// tell server we have joined the room
		toServerSocket.sendPlayerJoined( player );

		// redraw UI with our name in the list
		frontEnd.updateRoomListUI( gameInstance.players );

		console.log('ok, you\'ve joined room [' + gameInstance.game_id + ']');
	};

	/**
	 * Tell backend that one of our properties has updated.
	 */
	let _updatePlayerOnServer = function()
	{
		// don't send anything unless we've connected
		if ( _gameInstance != null )
		{
            toServerSocket._updatePlayerOnServer( _gameLogic.getPlayer() );
            //_socket.emit('player_attr_updated', _gameLogic.getPlayer());
        }
	};
	
	
	
	// -------------------------------------------------------
	// Lobby Config
	// -------------------------------------------------------
	
	/**
	 * Change my player name in the game room lobby
	 */
	clientRequest.setPlayerName = function( newPlayerName )
	{
		console.log('setting player name: ' + newPlayerName );
		
		_gameLogic.getPlayer().name = newPlayerName;
		
		// fire player name update
		_updatePlayerOnServer();
	};
		
	/**
	 * List any on-going games which I can join
	 */
	clientRequest.listGames = function()
	{
		console.log('retrieving list of games from server');
		
		return "empty";
	};





	
	/**
	 * Player has left the game room lobby
	 */
	clientRequest.leaveRoom = function( gameName )
	{
		console.log('leaving game room [' + gameName + ']');		
	};

	
	// -------------------------------------------------------
	// Game Play Setup
	// -------------------------------------------------------

	
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

	clientRequest.triggerStartPreGame = function()
	{
		_socket.emit( 'start_pre_game', null );	
	};

	clientRequest.triggerStartGame = function()
	{
		_socket.emit( 'start_game', _gameInstance.game_id );	
	};
	
	clientRequest.choosePlayer = function( player, playerIndex, playerConfig, playerChosenCallback )
	{
		var clientData = {
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
	
	clientRequest.sendChat = function( msg )
	{
		const data =
		{
			"roomName" : currentRoomName,
			"msg" : msg
		};

		console.log("sending chat data> ", data);

		_socket.emit('on_chat', data);
	};
	
	clientRequest.sendPosUpdate = function( spy )
	{
		if ( spy === undefined )
			return;
		
		_socket.emit('on_data', spy.getPos() );
	};

	clientRequest.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';

		_socket.emit( 'on_data', pos );
	};
		
	return clientRequest;
};

let frontEnd = toFrontEnd();

let gameLogic = GameLogic();

const gameControl = GameController( frontEnd, gameLogic );
// let fromServerSocket = fromServerSocket( socket, gameLogic, frontEnd );

//var gameLogic = new GameLogic();

//var gameControl = new GameControl( gameLogic );

//gameLogic.setGameControl( gameControl );



