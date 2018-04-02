




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
			console.log( serverPlayers.keys.length );
			//console.log( serverPlayers.player_data[  ] );
			
			for ( var p=0; p<serverPlayers.keys.length; p++)
			{
				var playerName = serverPlayers.player_data[ serverPlayers.keys[p] ].name;
				console.log( playerName );
				
				$('#player_list ul').append(
						$('<li>').append(
								$('<span>').attr('class', 'list-group-item player_list_entry').append( playerName )
							));
			}
	};
	
	_updatePlayerAttr = function( serverPlayers )
	{
		/*
		console.log('updating player attr');
		for ( var p=0; p<serverPlayers.length; p++)
		{
			
		}
		*/
	};
	
	_joinRoom = function( gameInstance, player )
	{
		var urlid = '/' + gameInstance.game_id;

		console.log('client joining ' + urlid + '/[' + gameInstance.datachannel + ']');
				
		socket = io( urlid );
		
		socket.on('connection', function(msg)
		{
			console.log('CONNECTED TO SERVER');
		});
		
		socket.on('player_attr_updated', function( serverPlayers, updatedPlayer )
		{
			console.log('player_attr_updated ' + serverPlayers);
			
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
		
		socket.on('player_left', function(serverPlayers, playerThatLeft)
		{
			console.log('player_left');
			console.log('player ' + playerThatLeft.name + ' has left the room');
			_updateRoomList( serverPlayers );
		});

		socket.on('player_joined', function(serverPlayers, newPlayer)
		{
			console.log('player_joined');
			console.log('player ' + newPlayer.name + ' has joined the room');
			_updateRoomList( serverPlayers );
		});

		socket.on('choose_player', function( playerChosen )
		{
			console.log('someone has chosen a player');
			
			
		});

		socket.on( gameInstance.chatchannel, function(msg)
		{
			console.log('got chat data[' + msg + ']');
		});
				
		socket.on( gameInstance.datachannel, function( spyPos )
		{
			// update spy with data
			_gameLogic.updatePlayerPos( spyPos );			
		});
				
		socket.on( 'start_pre_game', function()
		{
			console.log('SERVER IS STARTING PRE GAME!');
			_gameLogic.startPreGame();
		});

		socket.on( 'start_game', function( gameInstance )
		{
			console.log('SERVER IS STARTING OFFICIAL GAME!');
			//_gameLogic.startGame( gameInstance, _gameLogic.getPlayer() );
			_gameLogic.onPreGameComplete( gameInstance, _gameLogic.getPlayer() );
		});
		
		// save our player in gameLogic
		_gameLogic.setPlayer( player );
		
		//_player = player;
		_gameInstance = gameInstance;
		
		console.log( gameInstance );
		console.log( gameInstance.players );
		
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
	
	_setPlayerName = function( newName )
	{
		//_player.name = newName;
		_gameLogic.getPlayer().name = newName;
		
		// fire player name update
		_updatePlayer();
	};

	ctrl.setPlayerName = function( playerName )
	{
		console.log('setting player name: ' + playerName );
		_setPlayerName( playerName );
	};
	
	ctrl.sendChat = function( msg )
	{
		console.log('sending data {' + msg + '} on [' + _gameInstance.chatchannel + '] channel');
		socket.emit(_gameInstance.chatchannel, msg);
	};
	
	ctrl.listGames = function()
	{
		console.log('retrieving list of games from server');
		
		return "empty";
	};
	
	ctrl.joinRoom = function( roomName )
	{
		console.log('attempting to join game [' + roomName + ']');

		var clientData = {
				"game_id" : roomName,
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
		    		console.log( data );
		    		
		    		// ok so now a game was created on the server for us
		    		_joinRoom( data.gameInstance, data.player );		    	
		    },
		    error : function( err )
		    {
		    		console.error('ERROR! ' + err.responseText );
		    		console.error(err);
		    }
		});
	};
	
		
	ctrl.leaveRoom = function( gameName )
	{
		console.log('leaving game room [' + gameName + ']');		
	};

	ctrl.showGameOptions = function()
	{
		_gameLogic.showGameOptions();
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
				
				if ( data.success == true )
				{
					console.log('success choosing a player!');				
				}
				else
				{
					console.log('error choosing a player!');
				}

				playerChosenCallback( modalPlayerConfig, data.success );
			},
			error : function(err) {
				console.error('ERROR! ' + err.responseText);
				console.error(err);
				
				//playerChosenCallback( playerIndex, false );
			}
		});
	};
	
	ctrl.sendPosUpdate = function( spy )
	{
		// var pos = spy.getPos();
		//console.log('sent game data[action(' + pos.action + '), x(' + pos.x + '), y(' + pos.y + ') ]');

		if ( spy == undefined )
			return;
		
		socket.emit(_gameInstance.datachannel, spy.getPos() );
	};

	ctrl.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';
		//console.log('sent game data[action(' + pos.action + '), x(' + pos.x + '), y(' + pos.y + '), extra(' + pos.extra + ') ]');

		socket.emit( _gameInstance.datachannel, pos );
	};
	
	return ctrl;
};

var gameLogic = new GameLogic();

var gameControl = new GameControl( gameLogic );

gameLogic.setGameControl( gameControl );



