




var GameControl = function( gameLogic )
{
	var ctrl = {};
	
	var socket; 
	var _gameData = null;	
	var _player = {
	};
		
	var _gameLogic = gameLogic;
		
	updateRoomList = function( serverPlayers )
	{
			$('#player_list ul').empty();
			
			for ( var p=0; p<serverPlayers.length; p++)
			{
				var playerName = serverPlayers[p].name;
				
				$('#player_list ul').append(
						$('<li>').append(
								$('<span>').attr('class', 'list-group-item player_list_entry').append( playerName )
							));
			}
	};
	
	updatePlayerAttr = function( serverPlayers )
	{
		/*
		console.log('updating player attr');
		for ( var p=0; p<serverPlayers.length; p++)
		{
			
		}
		*/
	};
	
	_joinRoom = function( gameData, player )
	{
		var urlid = '/' + gameData.game_id;

		console.log('client joining ' + urlid + '/[' + gameData.datachannel + ']');
				
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
			if ( _player.player_id == updatedPlayer.player_id )
				_player = updatedPlayer;
			
			// redraw room members
			updateRoomList( serverPlayers );
			
			// update any player data
			updatePlayerAttr( serverPlayers );
		});
		
		socket.on('player_left', function(serverPlayers, playerThatLeft)
		{
			console.log('player ' + playerThatLeft.name + ' has left the room');
			updateRoomList( serverPlayers );
		});

		socket.on('player_joined', function(serverPlayers, newPlayer)
		{
			console.log('player ' + newPlayer.name + ' has joined the room');
			updateRoomList( serverPlayers );
		});
		
		socket.on( gameData.chatchannel, function(msg)
		{
			console.log('got chat data[' + msg + ']');
		});
				
		socket.on( gameData.datachannel, function(msg)
		{
			// update spy with data
			for ( var p = 0; p<players.length; p++)
			{
				players[p].setPos( msg );
			}
		});
		
		socket.on( 'start_pre_game', function()
		{
			console.log('SERVER IS STARTING PRE GAME!');
			_gameLogic.startPreGame();
		});

		socket.on( 'start_game', function()
		{
			console.log('SERVER IS STARTING OFFICIAL GAME!');
			_gameLogic.startGame();
		});
		
		_player = player;
		_gameData = gameData;
		
		console.log( gameData );
		console.log( gameData.players );
		
		socket.emit( 'player_joined', player );	
		updateRoomList( gameData.players );

		console.log('ok, you\'ve joined room [' + gameData.game_id + ']');
	};

	_updatePlayer = function()
	{
		// don't send anything unless we've connected
		if ( _gameData != null )
			socket.emit('player_attr_updated', _player );
	};
	
	_setPlayerName = function( newName )
	{
		_player.name = newName;
		
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
		console.log('sending data {' + msg + '} on [' + _gameData.chatchannel + '] channel');
		socket.emit(_gameData.chatchannel, msg);
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
				"player" : _player
		};
		
		$.ajax({
		    type: 'post',
		    url: '/room/join/',
		    data: JSON.stringify( clientData ),
		    contentType: "application/json",
		    success: function ( data ) {
		    	console.log( data );
		    		
		    	// ok so now a game was created on the server for us
		    	_joinRoom( data.gameData, data.player );		    	
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
		socket.emit( 'start_game', _gameData.game_id );	
	};
	
	ctrl.sendPosUpdate = function( spy )
	{
		//var pos = spy.getPos();
		//console.log('sent game data[action(' + pos.action + '), x(' + pos.x + '), y(' + pos.y + ') ]');

		socket.emit(_gameData.datachannel, spy.getPos() );
	};

	ctrl.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';
		//console.log('sent game data[action(' + pos.action + '), x(' + pos.x + '), y(' + pos.y + '), extra(' + pos.extra + ') ]');

		socket.emit(_gameData.datachannel, pos );
	};
	
	return ctrl;
};

var gameLogic = new GameLogic();

var gameControl = new GameControl( gameLogic );



