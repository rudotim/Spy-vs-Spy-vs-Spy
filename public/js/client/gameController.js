




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

	// the encapsulation of logic calls to send data to the server
	let _toServer;

	// the core game logic
	let _gameLogic;

	// ---------------
	// local copy of game data
	let _gameInstance = null;

	init();

	function init()
	{
		console.log("initialization");

		// gameControl
		_gameLogic = GameLogic( clientRequest );
	}


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

			_toClient = fromServerSocket(_socket, _gameLogic, frontEnd);

			_toServer = toServerSocket(_socket);

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

		currentRoomName = newRoomName;

		return _socket;
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

//let gameLogic = GameLogic();

const gameControl = GameController( frontEnd );
// let fromServerSocket = fromServerSocket( socket, gameLogic, frontEnd );

//var gameLogic = new GameLogic();

//var gameControl = new GameControl( gameLogic );

//gameLogic.setGameControl( gameControl );



