




var GameControl = function( gameLogic )
{
	var ctrl = {};
	
	var socket; 
	var _gameInstance = null;
		
	var _gameLogic = gameLogic;

	_updateRoomList = function( serverPlayers )
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
	
	_updatePlayerAttr = function( serverPlayers )
	{
		// TODO: Implement this?  Really it's just for name changes...
	};
	
	_joinRoom = function( gameInstance, player )
	{
		var urlid = '/' + gameInstance.name;

		console.log('client joining ' + urlid + '/[' + gameInstance.datachannel + ']');
				
		socket = io( urlid );
		
		socket.on('connection', function(msg)
		{
			console.log('CONNECTED TO SERVER');
		});
		
		// -------------------------------------------------------
		// Lobby Config
		// -------------------------------------------------------
		
		socket.on('on_player_joined', function(serverPlayers, newPlayer)
		{
			console.log('player_joined');
			console.log('player ' + newPlayer.name + ' has joined the room');
			_updateRoomList( serverPlayers );
		});

		socket.on('on_player_left', function(serverPlayers, playerThatLeft)
		{
			console.log('player_left');
			console.log('player ' + playerThatLeft.name + ' has left the room');
			_updateRoomList( serverPlayers );
		});

		socket.on('on_player_attr_updated', function( serverPlayers, updatedPlayer )
		{
			console.log('on_player_attr_updated ' + serverPlayers);
			
			// don't update unless it's our object
			/*
			if ( player.stub == true 
				|| player.player_id == updatedPlayer.player_id )
			{
				player = updatedPlayer;
				console.log('hey, it\'s our player[' + player.name + ' / ' + player.player_id + '] and are we leader? ' + player.isLeader );
			}
			*/
			
			var p = _gameLogic.getPlayer();
			if ( p.player_id == updatedPlayer.player_id )
				_gameLogic.setPlayer( p );
			
			//if ( _player.player_id == updatedPlayer.player_id )
			//	_player = updatedPlayer;
			
			// redraw room members
			_updateRoomList( serverPlayers );
			
			// update any player data
			_updatePlayerAttr( serverPlayers );
		});
		
		// -------------------------------------------------------
		// Game Play Config
		// -------------------------------------------------------

		socket.on('on_chosen_player', function( player_id, player_config )
		{
			console.log('someone has chosen a player> %o %o', player_id, player_config );
			
			_gameLogic.onChoosePlayer( player_id, player_config );
		});
		
		socket.on( 'on_start_pre_game', function()
		{
			console.log('SERVER IS STARTING PRE GAME!');
			_gameLogic.startPreGame();
		});

		socket.on( 'on_player_is_ready', function( player_id )
		{
			console.log('on_player_ready');
			_gameLogic.onPlayerReady( player_id );
		});
		
		socket.on( 'on_load_map', function( gameInstance )
		{
			console.log('on_load_map');
			_gameLogic.onLoadMapData( gameInstance );
		});
		
		socket.on( 'on_game_loading', function( game_loading_pct )
		{
			console.log('on_game_loading');
			_gameLogic.onGameLoading( game_loading_pct );
		});

		socket.on( 'on_start_game', function( gameInstance )
		{
			console.log('SERVER IS STARTING OFFICIAL GAME!');
			_gameLogic.onStartGame( gameInstance, _gameLogic.getPlayer() );
		});
			
		// -------------------------------------------------------
		// Game Play
		// -------------------------------------------------------

		socket.on( 'on_chat', function(msg)
		{
			console.log('got chat data[' + msg + ']');
		});
				
		socket.on( 'on_data', function( spyPos )
		{
			// update spy with data
			_gameLogic.updatePlayerPos( spyPos );			
		});

		socket.on( 'on_player_entered_room', function( player, room )
		{
			//console.log('on_player_entered_room');
			_gameLogic.onPlayerEnteredRoom( player, room );
		});

		socket.on( 'on_player_left_room', function( player, room )
		{
			//console.log('on_player_left_room');
			_gameLogic.onPlayerLeftRoom( player, room );
		});

		// -------------------------------------------------------
		
		// save our player in gameLogic
		_gameLogic.setPlayer( player );
		
		_gameInstance = gameInstance;
				
		socket.emit( 'player_joined', player );	
		_updateRoomList( gameInstance.players );

		console.log('ok, you\'ve joined room [' + gameInstance.game_id + ']');
	};

	_updatePlayer = function()
	{
		// don't send anything unless we've connected
		if ( _gameInstance != null )
			socket.emit('player_attr_updated', _gameLogic.getPlayer() );
	};
	
	
	
	// -------------------------------------------------------
	// Lobby Config
	// -------------------------------------------------------
	
	
	
	_setPlayerName = function( newName )
	{
		_gameLogic.getPlayer().name = newName;
		
		// fire player name update
		_updatePlayer();
	};

	/**
	 * Change my player name in the game room lobby
	 */
	ctrl.setPlayerName = function( playerName )
	{
		console.log('setting player name: ' + playerName );
		_setPlayerName( playerName );
	};
		
	/**
	 * List any on-going games which I can join
	 */
	ctrl.listGames = function()
	{
		console.log('retrieving list of games from server');
		
		return "empty";
	};
	
	/**
	 * Join or create a room with name
	 */
	ctrl.joinRoom = function( roomName )
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
		    			_joinRoom( data.gameInstance, data.player );
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
	ctrl.leaveRoom = function( gameName )
	{
		console.log('leaving game room [' + gameName + ']');		
	};

	
	// -------------------------------------------------------
	// Game Play Setup
	// -------------------------------------------------------

	
	/**
	 * Pop-up the options (player selection) modal window
	 */
	ctrl.showGameOptions = function()
	{
		_gameLogic.showGameOptions();
	};
	
	ctrl.triggerPlayerIsReady = function( player )
	{
		socket.emit( 'player_is_ready', player );	
	};

	ctrl.triggerPlayerLoadedMap = function( player )
	{
		socket.emit( 'player_has_loaded_map', player );	
	};

	ctrl.triggerStartPreGame = function()
	{
		socket.emit( 'start_pre_game', null );	
	};

	ctrl.triggerStartGame = function()
	{
		socket.emit( 'start_game', _gameInstance.game_id );	
	};
	
	ctrl.choosePlayer = function( player, modalPlayerConfig, playerChosenCallback )
	{
		var clientData = {
				player : player,
				modalPlayerConfig : modalPlayerConfig,
				gameId : _gameInstance.game_id
		};

		$.ajax({
			type : 'post',
			url : '/player/choose/',
			data : JSON.stringify(clientData),
			contentType : "application/json",
			success : function(data) {
				
				console.log(data);				
				playerChosenCallback( modalPlayerConfig, data.success );
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

	
	
	ctrl.sendPlayerEnteredRoom = function( player, teleports_to )
	{
		socket.emit('player_entered_room', player, teleports_to );
	};
	
	ctrl.sendPlayerLeftRoom = function( player, roomId )
	{
		socket.emit('player_left_room', player, roomId );
	};
	
	ctrl.sendChat = function( msg )
	{
		socket.emit('on_chat', msg);
	};
	
	ctrl.sendPosUpdate = function( spy )
	{
		if ( spy == undefined )
			return;
		
		socket.emit('on_data', spy.getPos() );
	};

	ctrl.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';

		socket.emit( 'on_data', pos );
	};
		
	return ctrl;
};

var gameLogic = new GameLogic();

var gameControl = new GameControl( gameLogic );

gameLogic.setGameControl( gameControl );



