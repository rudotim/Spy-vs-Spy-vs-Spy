




var GameControl = function( gameLogic )
{
	var clientRequest = {};
	
	// communication socket to server
	var _socket; 
	
	// local copy of game data
	var _gameInstance = null;
		
	// encapsulated methods to perform common game logic
	var _gameLogic = gameLogic;

	/**
	 * Update UI list of room members
	 */
	_updateRoomListUI = function( serverPlayers )
	{
		$('#player_list ul').empty();
		
		console.log( serverPlayers );
		
		var p=serverPlayers.length;
		while( p-- )
		{
			$('#player_list ul').append(
					$('<li>').append(
							$('<span>').attr('class', 'list-group-item player_list_entry').append( serverPlayers[p].name )
						));
		}
	};
	
	_updatePlayerOnServerAttr = function( serverPlayers )
	{
		// TODO: Implement this?  Really it's just for name changes...
	};
	
	_onJoinRoomSuccess = function( gameInstance, player )
	{
		var urlid = '/' + gameInstance.name;

		console.log('client joining ' + urlid + '/[' + gameInstance.datachannel + ']');
				
		// initialize socket to server and establish communication callback channels
		_socket = io( urlid );
		
		_socket.on('connection', function(msg)
		{
			console.log('CONNECTED TO SERVER');
		});
		
		// -------------------------------------------------------
		// Lobby Config
		// -------------------------------------------------------

		// -- Lobby callbacks from server -----------------------------------------------------
		
		_socket.on('on_player_joined', function(serverPlayers, newPlayer)
		{
			console.log('player joined room> ', newPlayer.name );
			_updateRoomListUI( serverPlayers );
		});

		_socket.on('on_player_left', function(serverPlayers, playerThatLeft)
		{
			console.log('player left room> ', playerThatLeft.name );
			_updateRoomListUI( serverPlayers );
		});

		/**
		 * The backend told us someone updated some player property
		 */
		_socket.on('on_player_attr_updated', function( serverPlayers, updatedPlayer )
		{
			console.log('on_player_attr_updated ' + serverPlayers);
						
			// find the player
			var p = _gameLogic.getPlayer();
			if ( p.player_id == updatedPlayer.player_id )
				_gameLogic.setPlayer( p );
			
			// redraw room members
			_updateRoomListUI( serverPlayers );
			
			// update any player data
			_updatePlayerOnServerAttr( serverPlayers );
		});
		
		// -------------------------------------------------------
		// Game Play Config
		// -------------------------------------------------------

		_socket.on('on_chosen_player', function( player_id, player_config )
		{
			console.log('someone has chosen a player> %o %o', player_id, player_config );
			
			_gameLogic.onChoosePlayer( player_id, player_config );
		});
		
		_socket.on( 'on_start_pre_game', function()
		{
			console.log('SERVER IS STARTING PRE GAME!');
			_gameLogic.onStartPreGame();
		});

		_socket.on( 'on_player_is_ready', function( player_id )
		{
			console.log('on_player_ready');
			_gameLogic.onPlayerReady( player_id );
		});
		
		_socket.on( 'on_load_map', function( gameInstance )
		{
			console.log('on_load_map');
			_gameLogic.onLoadMapData( gameInstance );
		});
		
		_socket.on( 'on_game_loading', function( game_loading_pct )
		{
			console.log('on_game_loading');
			_gameLogic.onGameLoading( game_loading_pct );
		});

		_socket.on( 'on_start_game', function( gameInstance )
		{
			console.log('SERVER IS STARTING OFFICIAL GAME!');
			_gameLogic.onStartGame( gameInstance, _gameLogic.getPlayer() );
		});
			
		// -------------------------------------------------------
		// Game Play
		// -------------------------------------------------------

		_socket.on( 'on_chat', function(msg)
		{
			console.log('got chat data[' + msg + ']');
		});
				
		_socket.on( 'on_data', function( spyPos )
		{
			// update spy with data
			_gameLogic.updatePlayerPos( spyPos );			
		});

		_socket.on( 'on_player_entered_room', function( player, room )
		{
			_gameLogic.onPlayerEnteredRoom( player, room );
		});

		_socket.on( 'on_player_left_room', function( player, room )
		{
			_gameLogic.onPlayerLeftRoom( player, room );
		});

		// -------------------------------------------------------
		
		// save our player in gameLogic
		_gameLogic.setPlayer( player );
		
		_gameInstance = gameInstance;
				
		// tell server we have joined the room
		_socket.emit( 'player_joined', player );
		
		// redraw UI with our name in the list
		_updateRoomListUI( gameInstance.players );

		console.log('ok, you\'ve joined room [' + gameInstance.game_id + ']');
	};

	/**
	 * Tell backend that one of our properties has updated.
	 */
	_updatePlayerOnServer = function()
	{
		// don't send anything unless we've connected
		if ( _gameInstance != null )
			_socket.emit('player_attr_updated', _gameLogic.getPlayer() );
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
	 * Join or create a room with name
	 */
	clientRequest.joinRoom = function( roomName )
	{
		console.log('attempting to join game [' + roomName + ']');

		var clientData = {
				"gameName" : roomName,
				"player" : _gameLogic.getPlayer()
		};
		
		$.ajax(
		{
		    type: 'post',
		    url: '/room/join/',
		    data: JSON.stringify( clientData ),
		    contentType: "application/json",
		    success: function ( data ) 
		    {
		    		if ( data != null )
		    		{
		    			// ok so now a game was created on the server for us
		    			_onJoinRoomSuccess( data.gameInstance, data.player );
		    		}
		    		else
		    		{
		    			console.error("failed to find game with name [" + roomName + "]");
		    		}
		    },
		    error : function( err )
		    {
		    		console.error('ERROR> %o', err );
		    }
		});
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
		_socket.emit('on_chat', msg);
	};
	
	clientRequest.sendPosUpdate = function( spy )
	{
		if ( spy == undefined )
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

var gameLogic = new GameLogic();

var gameControl = new GameControl( gameLogic );

gameLogic.setGameControl( gameControl );



