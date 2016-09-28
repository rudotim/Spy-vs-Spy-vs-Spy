/**
 * New node file
 */


var gameInstance;

function getGameDataStub( name )
{
	gameInstance = new GameInstance();
	
	return gameInstance.createNew( name );
}


var GameControl = function()
{
	var ctrl = {};
	var socket; // = io().connect('http://localhost:3000');
	var _gameInstance;	
	
	_joinRoom = function( gameData )
	{
		var urlid = '/' + gameData.name;

		console.log('client joining ' + urlid + '/[' + gameData.datachannel + ']');
										
		socket = io( urlid );
		
		socket.on('connection', function(msg)
		{
			console.log('CONNECTED TO SERVER');
		});
		
		socket.on( gameData.chatchannel, function(msg)
		{
			console.log('got chat data[' + msg + ']');
		});
				
		socket.on( gameData.datachannel, function(msg)
		{
			//console.log('got game data[action(' + msg.action + '), x(' + msg.x + '), y(' + msg.y + ') ]');
			
			// update spy with data
			for ( var p = 0; p<players.length; p++)
			{
				//console.log('found player: ' + players[p].name);
				//console.log( players[p] );
				players[p].setPos( msg );
			}
		});
		
		socket.on( 'start_game', function(msg)
		{
			console.log('SERVER IS STARTING GAME!');
			//ctrl.startGame();
			startGame( socket );

		});
		
		_gameInstance = gameData;		
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
	
	ctrl.joinRoom = function( gameData )
	{
		console.log('attempting to join game [' + gameData.name + ']');

		$.ajax({
		    type: 'post',
		    url: '/room/join/',
		    data: JSON.stringify(gameData),
		    contentType: "application/json",
		    success: function (data) {
		    	console.log( data );
		    	
		    	// ok so now a game was created on the server for us
		    	_joinRoom( data );
		    	
		    	// unlock the controls to start the game
		    	console.log('ok, you\'ve joined room [' + gameData.name + ']');
		    },
		    error : function(data)
		    {
		    	console.error('ERROR! ' + data.responseText );
		    	console.error(data);
		    }
		});
	};
	
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
	
	ctrl.closeServerRoom = function( gameName )
	{
		console.log('closing game room [' + gameName + ']');		
	};
	
	ctrl.triggerStartGame = function( gameData )
	{
		socket.emit( 'start_game', gameData);	
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


var gameControl = new GameControl();



