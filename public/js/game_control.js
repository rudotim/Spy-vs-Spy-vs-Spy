/**
 * New node file
 */



function getGameDataStub( name )
{
	//gameInstance = new GameInstance();
	//gameOptions = new GameOptions();
	
	//return gameInstance.createNew( name );
}



var GameControl = function( gameLogic )
{
	var ctrl = {};
	
	var socket; // = io().connect('http://localhost:3000');
	var _gameInstance;		
	var player = {
			name : 'noname',
			stub : true
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
	
	_joinRoom = function( gameData )
	{
		var urlid = '/' + gameData.name;

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
			if ( player.stub == true 
				|| player.player_id == updatedPlayer.player_id )
				player = updatedPlayer;
			
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
		
		socket.on( 'start_new_game', function(msg)
		{
			console.log('SERVER IS STARTING GAME!');
			_gameLogic.startNewGame( socket );
			//_gameLogic.showGameOptions( gameData );
		});
		
		// let everyone know we're here
		_setPlayerName( $('#player_name').val() );
		
		_gameInstance = gameData;		
	};

	_updatePlayer = function()
	{
		socket.emit('player_attr_updated', player );
	};
	
	_setPlayerName = function( newName )
	{
		player.name = newName;
		
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

		$.ajax({
		    type: 'post',
		    url: '/room/join/',
		    data: JSON.stringify( { "name" : roomName } ),
		    contentType: "application/json",
		    success: function ( newGameData ) {
		    	console.log( newGameData );
		    	
		    	// ok so now a game was created on the server for us
		    	_joinRoom( newGameData );
		    	
		    	// unlock the controls to start the game
		    	console.log('ok, you\'ve joined room [' + newGameData.name + ']');
		    },
		    error : function( err )
		    {
		    	console.error('ERROR! ' + err.responseText );
		    	console.error(err);
		    }
		});
	};
	
	/*
	ctrl.createServerRoom = function( gameData )
	{		
		console.log('creating game room [' + gameData.name + ']');
				
		$.ajax({
		    type: 'post',
		    url: '/room/create/',
		    data: JSON.stringify(gameData),
		    contentType: "application/json",
		    success: function (data) {
		    	console.log( data );
		    	
		    	// ok so now a game was created on the server for us
		    	_joinRoom( data );
		    	
		    	// unlock the controls to start the game
		    	console.log('ok, you\'re ready to start your game');
		    },
		    error : function(data)
		    {
		    	console.error('ERROR! ' + data.responseText );
		    	console.error(data);
		    }
		});
	};
	*/
		
	ctrl.leaveRoom = function( gameName )
	{
		console.log('leaving game room [' + gameName + ']');
		
	};

	ctrl.showGameOptions = function( gameData )
	{
		_gameLogic.showGameOptions( gameData );
	};
	
	ctrl.triggerStartNewGame = function( gameData )
	{
		socket.emit( 'start_new_game', gameData);	
	};
	
	ctrl.sendPosUpdate = function( spy )
	{
		//var pos = spy.getPos();
		//console.log('sent game data[action(' + pos.action + '), x(' + pos.x + '), y(' + pos.y + ') ]');

		socket.emit(_gameInstance.datachannel, spy.getPos() );
	};

	ctrl.sendStopUpdate = function( spy )
	{
		var pos = spy.getPos();
		pos.extra = 'stop';
		//console.log('sent game data[action(' + pos.action + '), x(' + pos.x + '), y(' + pos.y + '), extra(' + pos.extra + ') ]');

		socket.emit(_gameInstance.datachannel, pos );
	};
	
	return ctrl;
};

var gameLogic = new GameLogic();

var gameControl = new GameControl( gameLogic );



